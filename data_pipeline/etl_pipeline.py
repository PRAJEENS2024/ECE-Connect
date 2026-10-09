"""
Modular Python Data Engineering & Analytics Pipeline for ECE Connect.
- Extracts operational records from PostgreSQL
- Performs schema validation and duplicate detection
- Normalizes data and generates curated reporting tables
- Logs execution metadata and data-quality scorecards
"""

import os
import sys
import uuid
import datetime
import django
from django.utils import timezone
from django.db import transaction

# Setup Django standalone environment if run directly
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(os.path.join(BASE_DIR, 'backend'))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ece_backend.settings')
django.setup()

import pandas as pd
from core.models import StudentProfile, User, ETLJobRun
from achievements.models import Achievement, EventCategory
from issues.models import IssueReport
from feedback.models import DepartmentQuery
from gamification.models import PointLedger
from analytics.models import DailyEngagementMetric, CategoryAnalyticsSnapshot, RoomIssueSummary


def run_department_etl():
    job_id = f"job-{uuid.uuid4().hex[:12]}"
    started_at = timezone.now()
    records_extracted = 0
    records_validated = 0
    records_loaded = 0
    records_rejected = 0
    errors = []
    dq_issues = []

    print(f"[{started_at.strftime('%Y-%m-%d %H:%M:%S')}] Starting ETL Pipeline execution: {job_id}")

    try:
        # 1. EXTRACT
        achievements_qs = Achievement.objects.all().values(
            'id', 'student_id', 'title', 'event_name', 'category__name',
            'achievement_level', 'status', 'points_awarded', 'event_date', 'created_at'
        )
        issues_qs = IssueReport.objects.all().values(
            'id', 'reference_id', 'reported_by_id', 'category', 'building',
            'room__room_number', 'room_number_text', 'priority', 'status', 'resolved_at', 'created_at'
        )
        queries_qs = DepartmentQuery.objects.all().values(
            'id', 'reference_id', 'student_id', 'category', 'status', 'created_at'
        )
        ledger_qs = PointLedger.objects.all().values(
            'id', 'student_id', 'points', 'rule_code', 'idempotency_key', 'created_at'
        )

        df_achievements = pd.DataFrame(list(achievements_qs))
        df_issues = pd.DataFrame(list(issues_qs))
        df_queries = pd.DataFrame(list(queries_qs))
        df_ledger = pd.DataFrame(list(ledger_qs))

        records_extracted = len(df_achievements) + len(df_issues) + len(df_queries) + len(df_ledger)
        print(f"Extracted {records_extracted} total operational records.")

        # 2. VALIDATE & DATA QUALITY CHECKS
        # Check duplicate achievements (same student and same event title)
        if not df_achievements.empty:
            dup_achievements = df_achievements.duplicated(subset=['student_id', 'title'], keep=False)
            dup_count = dup_achievements.sum()
            if dup_count > 0:
                dq_issues.append(f"Detected {dup_count} duplicate achievement submission titles.")

            # Validate date formats and required fields
            valid_achievements = df_achievements[df_achievements['title'].notnull() & df_achievements['event_date'].notnull()]
            records_rejected += len(df_achievements) - len(valid_achievements)
            df_achievements = valid_achievements

        # Check duplicate ledger keys (should be 0 due to unique constraint)
        if not df_ledger.empty:
            dup_keys = df_ledger.duplicated(subset=['idempotency_key'], keep=False).sum()
            if dup_keys > 0:
                dq_issues.append(f"Data anomaly: {dup_keys} duplicate ledger idempotency keys found.")

        # Check issue rooms
        if not df_issues.empty:
            missing_loc = df_issues[df_issues['building'].isnull()].shape[0]
            if missing_loc > 0:
                dq_issues.append(f"{missing_loc} issue reports missing building location.")

        records_validated = records_extracted - records_rejected

        # 3. TRANSFORM & RECONCILE
        with transaction.atomic():
            # A. Populate Room Issue Summaries
            if not df_issues.empty:
                room_col = df_issues['room__room_number'].fillna(df_issues['room_number_text']).fillna('Unknown Room')
                df_issues['effective_room'] = room_col
                
                grouped_rooms = df_issues.groupby(['effective_room', 'building'])
                for (room_name, bldg), group in grouped_rooms:
                    tot = len(group)
                    open_count = len(group[~group['status'].isin([IssueReport.Status.RESOLVED, IssueReport.Status.CLOSED])])
                    top_cat = group['category'].mode()[0] if not group['category'].empty else 'OTHER'
                    
                    RoomIssueSummary.objects.update_or_create(
                        room_number=room_name,
                        defaults={
                            'building': bldg or 'ECE Block',
                            'total_issues': tot,
                            'open_issues': open_count,
                            'recurring_category': top_cat,
                            'last_reported_at': timezone.now()
                        }
                    )
                    records_loaded += 1

            # B. Populate Category Snapshots
            today = timezone.now().date()
            if not df_achievements.empty:
                cat_ach = df_achievements.groupby('category__name')
                for cat_name, group in cat_ach:
                    CategoryAnalyticsSnapshot.objects.update_or_create(
                        snapshot_date=today,
                        category_type='ACHIEVEMENT',
                        category_name=cat_name or 'Uncategorized',
                        defaults={
                            'total_count': len(group),
                            'verified_or_resolved_count': len(group[group['status'] == Achievement.Status.APPROVED])
                        }
                    )
                    records_loaded += 1

            if not df_issues.empty:
                cat_iss = df_issues.groupby('category')
                for cat_name, group in cat_iss:
                    CategoryAnalyticsSnapshot.objects.update_or_create(
                        snapshot_date=today,
                        category_type='ISSUE',
                        category_name=cat_name or 'OTHER',
                        defaults={
                            'total_count': len(group),
                            'verified_or_resolved_count': len(group[group['status'] == IssueReport.Status.RESOLVED])
                        }
                    )
                    records_loaded += 1

            # C. Populate Daily Engagement Metrics for past 14 days
            for d in range(14):
                day_date = today - datetime.timedelta(days=d)
                
                day_ach = df_achievements[pd.to_datetime(df_achievements['created_at']).dt.date == day_date] if not df_achievements.empty else pd.DataFrame()
                day_iss = df_issues[pd.to_datetime(df_issues['created_at']).dt.date == day_date] if not df_issues.empty else pd.DataFrame()
                day_qry = df_queries[pd.to_datetime(df_queries['created_at']).dt.date == day_date] if not df_queries.empty else pd.DataFrame()
                day_pts = df_ledger[pd.to_datetime(df_ledger['created_at']).dt.date == day_date] if not df_ledger.empty else pd.DataFrame()

                tot_pts = int(day_pts['points'].sum()) if not day_pts.empty else 0
                verified_ach = len(day_ach[day_ach['status'] == Achievement.Status.APPROVED]) if not day_ach.empty else 0
                resolved_iss = len(day_iss[day_iss['status'] == IssueReport.Status.RESOLVED]) if not day_iss.empty else 0

                DailyEngagementMetric.objects.update_or_create(
                    date=day_date,
                    defaults={
                        'active_users': max(1, len(day_ach) + len(day_iss) + len(day_qry)),
                        'achievements_submitted': len(day_ach),
                        'achievements_verified': verified_ach,
                        'issues_reported': len(day_iss),
                        'issues_resolved': resolved_iss,
                        'queries_submitted': len(day_qry),
                        'points_awarded': tot_pts,
                    }
                )
                records_loaded += 1

        # 4. RECORD JOB RUN METADATA
        completed_at = timezone.now()
        job_run = ETLJobRun.objects.create(
            job_id=job_id,
            job_name="ECE Department Operational ETL Pipeline",
            status=ETLJobRun.Status.SUCCESS,
            records_extracted=records_extracted,
            records_validated=records_validated,
            records_loaded=records_loaded,
            records_rejected=records_rejected,
            started_at=started_at,
            completed_at=completed_at,
            error_log="\n".join(errors) if errors else "Pipeline completed with 0 errors.",
            quality_report={
                'data_quality_score': round((records_validated / max(1, records_extracted)) * 100, 1),
                'anomalies_detected': len(dq_issues),
                'details': dq_issues,
                'tables_reconciled': ['DailyEngagementMetric', 'CategoryAnalyticsSnapshot', 'RoomIssueSummary']
            }
        )

        print(f"ETL completed successfully! Job: {job_id}, Loaded: {records_loaded} records.")
        return {
            'success': True,
            'job_id': job_id,
            'records_extracted': records_extracted,
            'records_validated': records_validated,
            'records_loaded': records_loaded,
            'records_rejected': records_rejected,
            'duration_seconds': (completed_at - started_at).total_seconds(),
            'quality_report': job_run.quality_report
        }

    except Exception as e:
        completed_at = timezone.now()
        err_msg = str(e)
        ETLJobRun.objects.create(
            job_id=job_id,
            job_name="ECE Department Operational ETL Pipeline",
            status=ETLJobRun.Status.FAILED,
            records_extracted=records_extracted,
            records_validated=records_validated,
            records_loaded=records_loaded,
            records_rejected=records_rejected,
            started_at=started_at,
            completed_at=completed_at,
            error_log=err_msg,
            quality_report={'error': err_msg}
        )
        print(f"ETL Failed: {err_msg}")
        return {'success': False, 'job_id': job_id, 'error': err_msg}


if __name__ == '__main__':
    run_department_etl()
