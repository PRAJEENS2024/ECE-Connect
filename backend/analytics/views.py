from rest_framework.decorators import api_view, permission_classes
from rest_framework import permissions, status
from rest_framework.response import Response
from django.db.models import Count, Sum, Q
from django.utils import timezone
import datetime
from core.models import User, StudentProfile, FacultyProfile, ETLJobRun
from achievements.models import Achievement, EventCategory
from issues.models import IssueReport
from feedback.models import DepartmentQuery
from gamification.models import PointLedger
from .models import DailyEngagementMetric, CategoryAnalyticsSnapshot, RoomIssueSummary


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def department_dashboard_kpis(request):
    """
    Real-time departmental metrics and analytical breakdown computed from PostgreSQL records.
    """
    total_students = StudentProfile.objects.count()
    total_faculty = FacultyProfile.objects.count()
    
    # Achievements metrics
    verified_achievements = Achievement.objects.filter(status=Achievement.Status.APPROVED).count()
    pending_achievements = Achievement.objects.filter(status=Achievement.Status.PENDING).count()
    hackathon_submissions = Achievement.objects.filter(
        Q(event_name__icontains='hack') | Q(title__icontains='hack')
    ).count()

    # Issue metrics
    total_issues = IssueReport.objects.count()
    open_issues = IssueReport.objects.exclude(status__in=[IssueReport.Status.RESOLVED, IssueReport.Status.CLOSED]).count()
    high_priority_issues = IssueReport.objects.filter(
        priority__in=[IssueReport.Priority.HIGH, IssueReport.Priority.URGENT]
    ).exclude(status__in=[IssueReport.Status.RESOLVED, IssueReport.Status.CLOSED]).count()
    resolved_issues = IssueReport.objects.filter(status=IssueReport.Status.RESOLVED).count()

    # Query metrics
    pending_queries = DepartmentQuery.objects.exclude(status__in=[DepartmentQuery.Status.RESOLVED, DepartmentQuery.Status.CLOSED]).count()

    # Points metrics
    total_points = PointLedger.objects.filter(points__gt=0).aggregate(total=Sum('points'))['total'] or 0

    # Category breakdown for achievements
    achievement_categories = list(
        Achievement.objects.values('category__name')
        .annotate(total=Count('id'), approved=Count('id', filter=Q(status=Achievement.Status.APPROVED)))
        .order_by('-total')
    )

    # Category breakdown for issues
    issue_categories = list(
        IssueReport.objects.values('category')
        .annotate(total=Count('id'), open=Count('id', filter=~Q(status__in=[IssueReport.Status.RESOLVED, IssueReport.Status.CLOSED])))
        .order_by('-total')
    )
    # Format labels
    category_labels = dict(IssueReport.Category.choices)
    formatted_issue_cats = [
        {'name': category_labels.get(item['category'], item['category']), 'total': item['total'], 'open': item['open']}
        for item in issue_categories
    ]

    # Year-wise participation
    year_distribution = list(
        StudentProfile.objects.values('year_of_study')
        .annotate(
            students=Count('id'),
            total_points=Sum('total_points'),
            verified=Sum('verified_achievements_count')
        )
        .order_by('year_of_study')
    )

    # Recent 6 months submissions trend
    now = timezone.now()
    monthly_trend = []
    for i in range(5, -1, -1):
        target_month = (now.month - i - 1) % 12 + 1
        month_name = datetime.date(2026, target_month, 1).strftime('%b')
        count = Achievement.objects.filter(created_at__month=target_month).count()
        verified_count = Achievement.objects.filter(created_at__month=target_month, status=Achievement.Status.APPROVED).count()
        issues_count = IssueReport.objects.filter(created_at__month=target_month).count()
        monthly_trend.append({
            'month': month_name,
            'submissions': count,
            'verified': verified_count,
            'issues': issues_count
        })

    return Response({
        'kpis': {
            'total_students': total_students,
            'total_faculty': total_faculty,
            'verified_achievements': verified_achievements,
            'pending_achievements': pending_achievements,
            'hackathon_submissions': hackathon_submissions,
            'total_issues': total_issues,
            'open_issues': open_issues,
            'high_priority_issues': high_priority_issues,
            'resolved_issues': resolved_issues,
            'pending_queries': pending_queries,
            'total_department_points': total_points,
            'resolution_rate': round((resolved_issues / total_issues * 100), 1) if total_issues > 0 else 100.0,
        },
        'achievement_categories': achievement_categories,
        'issue_categories': formatted_issue_cats,
        'year_distribution': year_distribution,
        'monthly_trend': monthly_trend,
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def etl_pipeline_history(request):
    runs = ETLJobRun.objects.all()[:20]
    data = []
    for r in runs:
        data.append({
            'job_id': r.job_id,
            'job_name': r.job_name,
            'status': r.status,
            'records_extracted': r.records_extracted,
            'records_validated': r.records_validated,
            'records_loaded': r.records_loaded,
            'records_rejected': r.records_rejected,
            'started_at': r.started_at,
            'completed_at': r.completed_at,
            'duration_seconds': (r.completed_at - r.started_at).total_seconds() if r.completed_at else None,
            'quality_report': r.quality_report,
            'error_log': r.error_log,
        })
    return Response(data)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def trigger_etl_run(request):
    """
    Executes the Python data engineering ETL pipeline.
    Validates schemas, removes duplicates, calculates analytical tables, and logs results.
    """
    from data_pipeline.etl_pipeline import run_department_etl
    result = run_department_etl()
    return Response(result)
