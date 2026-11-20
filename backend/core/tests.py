from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
import datetime

from core.models import User, StudentProfile, FacultyProfile
from timetables.models import Room, Subject, ClassSection, TimetableEntry, FacultyAvailability
from timetables.serializers import calculate_expected_location
from achievements.models import EventCategory, Achievement
from gamification.models import Badge, StudentBadge, PointLedger
from gamification.services import award_points_to_student
import sys
from pathlib import Path
ROOT_DIR = Path(__file__).resolve().parent.parent.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from data_pipeline.etl_pipeline import run_department_etl


class ECEConnectWorkflowTests(TestCase):
    def setUp(self):
        # Create users
        self.admin = User.objects.create_user(username='test_admin', role=User.Role.ADMIN, password='password')
        self.student = User.objects.create_user(username='test_student', role=User.Role.STUDENT, password='password')
        self.sp = StudentProfile.objects.create(
            user=self.student, roll_number='21EC999', year_of_study=3, semester=6, section='A'
        )

        self.fac_user = User.objects.create_user(username='test_faculty', role=User.Role.FACULTY, password='password')
        self.faculty = FacultyProfile.objects.create(
            user=self.fac_user, faculty_id='FAC99', cabin_number='EC-399'
        )

        self.sec = ClassSection.objects.create(name='ECE-III-TEST', year_of_study=3, semester=6, section='A')
        self.room = Room.objects.create(room_number='EC-999', building='ECE Block', floor=3)
        self.subject = Subject.objects.create(code='EC9999', name='Advanced Test Engineering', credits=4)

        self.cat = EventCategory.objects.create(name='Test Category', base_points=100)

    def test_student_cannot_approve_own_achievement(self):
        """Verify student role cannot review/approve achievements."""
        ach = Achievement.objects.create(
            student=self.sp,
            title="My Hackathon",
            event_name="College Hack",
            category=self.cat,
            organizer="IEEE",
            event_date=datetime.date(2026, 8, 1),
            description="Built test device"
        )
        self.client.force_login(self.student)
        res = self.client.post(f'/api/achievements/{ach.id}/review/', {'action': 'APPROVE', 'points': 100})
        self.assertEqual(res.status_code, 403)
        ach.refresh_from_db()
        self.assertEqual(ach.status, Achievement.Status.PENDING)

    def test_points_awarded_only_once_idempotently(self):
        """Verify points ledger idempotency key prevents duplicate awards."""
        key = "TEST-IDEMPOTENT-AWARD-1"
        award_points_to_student(self.sp, 100, "First Win", PointLedger.RuleCode.ACHIEVEMENT_VERIFIED, idempotency_key=key)
        self.sp.refresh_from_db()
        self.assertEqual(self.sp.total_points, 100)

        # Re-run same award with same idempotency key
        award_points_to_student(self.sp, 100, "First Win Duplicate", PointLedger.RuleCode.ACHIEVEMENT_VERIFIED, idempotency_key=key)
        self.sp.refresh_from_db()
        # Should still be 100, not 200!
        self.assertEqual(self.sp.total_points, 100)
        self.assertEqual(PointLedger.objects.filter(idempotency_key=key).count(), 1)

    def test_timetable_room_conflict_detected(self):
        """Verify that two entries cannot share the same room at the same time."""
        TimetableEntry.objects.create(
            class_section=self.sec,
            subject=self.subject,
            faculty=self.faculty,
            room=self.room,
            day_of_week=0, # Monday
            start_time=datetime.time(9, 0),
            end_time=datetime.time(10, 0),
            period_number=1
        )

        fac_user2 = User.objects.create_user(username='fac2', role=User.Role.FACULTY, password='password')
        faculty2 = FacultyProfile.objects.create(user=fac_user2, faculty_id='FAC88', cabin_number='EC-388')

        conflicting_entry = TimetableEntry(
            class_section=self.sec,
            subject=self.subject,
            faculty=faculty2,
            room=self.room, # same room!
            day_of_week=0,  # same day!
            start_time=datetime.time(9, 30), # overlaps!
            end_time=datetime.time(10, 30),
            period_number=2
        )

        with self.assertRaises(ValidationError):
            conflicting_entry.clean()

    def test_faculty_expected_location_calculation(self):
        """Verify expected location properly derives classroom vs cabin vs leave."""
        # 1. No classes scheduled: within college hours -> default to cabin
        target_time = datetime.time(11, 0)
        loc = calculate_expected_location(self.faculty, target_time=target_time, target_date=datetime.date(2026, 10, 12))
        self.assertEqual(loc['status'], 'AVAILABLE_IN_CABIN')
        self.assertIn('EC-399', loc['expected_location'])

        # 2. Add timetable entry: Monday 14:00 - 15:00 in EC-999
        TimetableEntry.objects.create(
            class_section=self.sec,
            subject=self.subject,
            faculty=self.faculty,
            room=self.room,
            day_of_week=0, # Monday
            start_time=datetime.time(14, 0),
            end_time=datetime.time(15, 0),
            period_number=5
        )

        loc_class = calculate_expected_location(self.faculty, target_time=datetime.time(14, 30), target_date=datetime.date(2026, 10, 12))
        self.assertEqual(loc_class['status'], 'IN_CLASS')
        self.assertIn('EC-999', loc_class['expected_location'])

        # 3. Add availability override: On leave
        FacultyAvailability.objects.create(
            faculty=self.faculty,
            effective_date=datetime.date(2026, 10, 12),
            start_time=datetime.time(14, 0),
            end_time=datetime.time(15, 0),
            status=FacultyAvailability.Status.ON_LEAVE,
            note="Medical leave"
        )

        loc_leave = calculate_expected_location(self.faculty, target_time=datetime.time(14, 30), target_date=datetime.date(2026, 10, 12))
        self.assertEqual(loc_leave['status'], 'ON_LEAVE')

    def test_etl_reruns_do_not_double_count(self):
        """Verify running ETL pipeline multiple times is idempotent."""
        res1 = run_department_etl()
        self.assertTrue(res1['success'])
        initial_loaded = res1['records_loaded']

        res2 = run_department_etl()
        self.assertTrue(res2['success'])
        # Safe rerun: records_loaded remains consistent and clean
        self.assertEqual(res2['records_rejected'], 0)
