from django.db import models
from django.conf import settings
from core.models import StudentProfile, User


class EventCategory(models.Model):
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    base_points = models.IntegerField(default=50)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.name} ({self.base_points} pts)"


class Achievement(models.Model):
    class Level(models.TextChoices):
        PARTICIPANT = 'PARTICIPANT', 'Participant'
        SHORTLISTED = 'SHORTLISTED', 'Shortlisted'
        SEMI_FINALIST = 'SEMI_FINALIST', 'Semi-Finalist'
        FINALIST = 'FINALIST', 'Finalist'
        SPECIAL_RECOGNITION = 'SPECIAL_RECOGNITION', 'Special Recognition / Consolation'
        THIRD_PLACE = 'THIRD_PLACE', '3rd Place'
        SECOND_PLACE = 'SECOND_PLACE', '2nd Place'
        FIRST_PLACE = 'FIRST_PLACE', '1st Place'
        WINNER = 'WINNER', 'Overall Winner'
        OTHER = 'OTHER', 'Other Contribution'

    class Status(models.TextChoices):
        DRAFT = 'DRAFT', 'Draft'
        PENDING = 'PENDING', 'Pending Verification'
        APPROVED = 'APPROVED', 'Verified & Approved'
        REJECTED = 'REJECTED', 'Rejected'
        CHANGES_REQUESTED = 'CHANGES_REQUESTED', 'Changes Requested'

    # Level multiplier for points calculation
    LEVEL_MULTIPLIERS = {
        Level.PARTICIPANT: 1.0,
        Level.SHORTLISTED: 1.3,
        Level.SEMI_FINALIST: 1.6,
        Level.FINALIST: 2.0,
        Level.SPECIAL_RECOGNITION: 2.2,
        Level.THIRD_PLACE: 2.5,
        Level.SECOND_PLACE: 3.0,
        Level.FIRST_PLACE: 3.5,
        Level.WINNER: 4.0,
        Level.OTHER: 1.0,
    }

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='achievements')
    title = models.CharField(max_length=200)
    event_name = models.CharField(max_length=200)
    category = models.ForeignKey(EventCategory, on_delete=models.PROTECT, related_name='achievements')
    organizer = models.CharField(max_length=150)
    event_date = models.DateField()
    
    is_team = models.BooleanField(default=False)
    team_name = models.CharField(max_length=150, blank=True)

    achievement_level = models.CharField(max_length=30, choices=Level.choices, default=Level.PARTICIPANT)
    points_awarded = models.IntegerField(default=0)
    description = models.TextField()
    skills_used = models.CharField(max_length=255, blank=True)
    event_website = models.URLField(blank=True)
    
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.PENDING, db_index=True)
    
    reviewed_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='reviewed_achievements')
    reviewed_at = models.DateTimeField(null=True, blank=True)
    reviewer_feedback = models.TextField(blank=True)
    student_confirmed = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-event_date', '-created_at']

    def calculate_suggested_points(self):
        base = self.category.base_points if self.category else 50
        multiplier = self.LEVEL_MULTIPLIERS.get(self.achievement_level, 1.0)
        return int(base * multiplier)

    def __str__(self):
        return f"{self.title} - {self.student.user.get_full_name()} ({self.get_achievement_level_display()})"


class TeamMember(models.Model):
    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='team_members')
    student = models.ForeignKey(StudentProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='team_participations')
    external_name = models.CharField(max_length=100, blank=True)
    role_description = models.CharField(max_length=150, default='Core Contributor')
    points_awarded = models.IntegerField(default=0)

    def __str__(self):
        name = self.student.user.get_full_name() if self.student else self.external_name
        return f"{name} in {self.achievement.title}"


class AchievementEvidence(models.Model):
    class EvidenceType(models.TextChoices):
        CERTIFICATE = 'CERTIFICATE', 'Certificate of Merit/Participation'
        PHOTOGRAPH = 'PHOTOGRAPH', 'Photograph/Stage Moment'
        VIDEO_LINK = 'VIDEO_LINK', 'Demo Video Link'
        PROJECT_LINK = 'PROJECT_LINK', 'GitHub / Project URL'
        DOCUMENT = 'DOCUMENT', 'Presentation / Paper PDF'

    achievement = models.ForeignKey(Achievement, on_delete=models.CASCADE, related_name='evidence')
    evidence_type = models.CharField(max_length=20, choices=EvidenceType.choices, default=EvidenceType.CERTIFICATE)
    file = models.FileField(upload_to='achievements/evidence/', null=True, blank=True)
    external_url = models.URLField(blank=True)
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.get_evidence_type_display()} for {self.achievement.title}"
