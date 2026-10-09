from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone


class User(AbstractUser):
    class Role(models.TextChoices):
        STUDENT = 'STUDENT', 'Student'
        FACULTY = 'FACULTY', 'Faculty'
        PRESIDENT = 'PRESIDENT', 'ECE Student President / Coordinator'
        ADMIN = 'ADMIN', 'Department Administrator'

    role = models.CharField(
        max_length=20,
        choices=Role.choices,
        default=Role.STUDENT,
        db_index=True
    )
    phone = models.CharField(max_length=20, blank=True)
    avatar = models.ImageField(upload_to='avatars/', null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def is_student(self):
        return self.role == self.Role.STUDENT

    @property
    def is_faculty(self):
        return self.role == self.Role.FACULTY

    @property
    def is_president(self):
        return self.role == self.Role.PRESIDENT

    @property
    def is_admin_or_president(self):
        return self.role in [self.Role.ADMIN, self.Role.PRESIDENT] or self.is_superuser


class StudentProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='student_profile')
    roll_number = models.CharField(max_length=20, unique=True, db_index=True)
    department = models.CharField(max_length=100, default='Electronics and Communication Engineering')
    year_of_study = models.IntegerField(default=3, choices=[(1, '1st Year'), (2, '2nd Year'), (3, '3rd Year'), (4, '4th Year')])
    semester = models.IntegerField(default=6, choices=[(i, f'Semester {i}') for i in range(1, 9)])
    section = models.CharField(max_length=5, default='A')
    
    # Denormalized counters for fast queries and analytics
    total_points = models.IntegerField(default=0, db_index=True)
    verified_achievements_count = models.IntegerField(default=0)
    hackathons_count = models.IntegerField(default=0)
    classroom_issues_count = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} ({self.roll_number})"


class FacultyProfile(models.Model):
    class AvailabilityStatus(models.TextChoices):
        AVAILABLE = 'AVAILABLE', 'Available in Cabin'
        IN_CLASS = 'IN_CLASS', 'Engaged in Class/Lab'
        OFFICE_HOURS = 'OFFICE_HOURS', 'Office Hours (Open Door)'
        IN_MEETING = 'IN_MEETING', 'In Department Meeting'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'
        UNCONFIRMED = 'UNCONFIRMED', 'Availability Unconfirmed'

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='faculty_profile')
    faculty_id = models.CharField(max_length=20, unique=True, db_index=True)
    department = models.CharField(max_length=100, default='Electronics and Communication Engineering')
    designation = models.CharField(max_length=100, default='Assistant Professor')
    cabin_number = models.CharField(max_length=50, default='EC-301')
    office_hours = models.CharField(max_length=150, default='Mon, Wed 3:00 PM - 4:30 PM')
    bio = models.TextField(blank=True)
    specialization = models.CharField(max_length=255, default='VLSI Design, Embedded Systems')
    phone = models.CharField(max_length=20, blank=True)
    
    current_status = models.CharField(
        max_length=30,
        choices=AvailabilityStatus.choices,
        default=AvailabilityStatus.AVAILABLE
    )
    status_note = models.CharField(max_length=255, blank=True)
    status_updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.get_full_name() or self.user.username} - {self.designation}"


class Announcement(models.Model):
    class Priority(models.TextChoices):
        NORMAL = 'NORMAL', 'Normal'
        IMPORTANT = 'IMPORTANT', 'Important'
        URGENT = 'URGENT', 'Urgent Announcement'

    class TargetRole(models.TextChoices):
        ALL = 'ALL', 'All Department Members'
        STUDENT = 'STUDENT', 'Students Only'
        FACULTY = 'FACULTY', 'Faculty Only'

    title = models.CharField(max_length=255)
    content = models.TextField()
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='announcements')
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.NORMAL)
    target_role = models.CharField(max_length=20, choices=TargetRole.choices, default=TargetRole.ALL)
    is_pinned = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_pinned', '-created_at']

    def __str__(self):
        return self.title


class Notification(models.Model):
    class NotificationType(models.TextChoices):
        ACHIEVEMENT = 'ACHIEVEMENT', 'Achievement'
        ISSUE = 'ISSUE', 'Classroom Issue'
        QUERY = 'QUERY', 'Student Query'
        TIMETABLE = 'TIMETABLE', 'Timetable Change'
        BADGE = 'BADGE', 'Badge Unlocked'
        SYSTEM = 'SYSTEM', 'System Alert'

    recipient = models.ForeignKey(User, on_delete=models.CASCADE, related_name='notifications')
    title = models.CharField(max_length=255)
    message = models.TextField()
    link = models.CharField(max_length=255, blank=True)
    is_read = models.BooleanField(default=False)
    notification_type = models.CharField(
        max_length=20,
        choices=NotificationType.choices,
        default=NotificationType.SYSTEM
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.recipient.username} - {self.title}"


class AuditLog(models.Model):
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='audit_logs')
    action = models.CharField(max_length=100)
    target_model = models.CharField(max_length=100)
    target_id = models.CharField(max_length=100)
    details = models.JSONField(default=dict)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']

    def __str__(self):
        return f"[{self.timestamp.strftime('%Y-%m-%d %H:%M')}] {self.actor} - {self.action} on {self.target_model}:{self.target_id}"


class ETLJobRun(models.Model):
    class Status(models.TextChoices):
        RUNNING = 'RUNNING', 'Running'
        SUCCESS = 'SUCCESS', 'Completed Successfully'
        FAILED = 'FAILED', 'Failed with Errors'

    job_id = models.CharField(max_length=64, unique=True)
    job_name = models.CharField(max_length=100, default='Department Analytics Pipeline')
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.RUNNING)
    records_extracted = models.IntegerField(default=0)
    records_validated = models.IntegerField(default=0)
    records_loaded = models.IntegerField(default=0)
    records_rejected = models.IntegerField(default=0)
    started_at = models.DateTimeField(default=timezone.now)
    completed_at = models.DateTimeField(null=True, blank=True)
    error_log = models.TextField(blank=True)
    quality_report = models.JSONField(default=dict)

    class Meta:
        ordering = ['-started_at']

    def __str__(self):
        return f"{self.job_name} ({self.job_id}) - {self.status}"
