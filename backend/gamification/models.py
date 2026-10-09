from django.db import models
from core.models import StudentProfile, User


class Badge(models.Model):
    class CriteriaType(models.TextChoices):
        POINTS_THRESHOLD = 'POINTS_THRESHOLD', 'Points Milestone'
        ACHIEVEMENT_COUNT = 'ACHIEVEMENT_COUNT', 'Verified Achievements Count'
        HACKATHON_COUNT = 'HACKATHON_COUNT', 'Hackathon Participations'
        COMMUNITY_HELPER = 'COMMUNITY_HELPER', 'Community Classroom Reporter'
        MANUAL_AWARD = 'MANUAL_AWARD', 'President / Faculty Merit Award'

    name = models.CharField(max_length=100, unique=True)
    slug = models.SlugField(max_length=100, unique=True)
    description = models.TextField()
    icon_name = models.CharField(max_length=50, default='Award')
    criteria_type = models.CharField(max_length=30, choices=CriteriaType.choices, default=CriteriaType.POINTS_THRESHOLD)
    criteria_value = models.IntegerField(default=100)
    color = models.CharField(max_length=30, default='teal')  # 'teal', 'amber', 'emerald', 'violet', 'cyan'
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} ({self.get_criteria_type_display()} >= {self.criteria_value})"


class StudentBadge(models.Model):
    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='earned_badges')
    badge = models.ForeignKey(Badge, on_delete=models.CASCADE, related_name='awarded_students')
    awarded_at = models.DateTimeField(auto_now_add=True)
    note = models.CharField(max_length=255, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['student', 'badge'], name='unique_student_badge')
        ]
        ordering = ['-awarded_at']

    def __str__(self):
        return f"{self.student.user.get_full_name()} earned {self.badge.name}"


class PointLedger(models.Model):
    class RuleCode(models.TextChoices):
        ACHIEVEMENT_VERIFIED = 'ACHIEVEMENT_VERIFIED', 'Verified Achievement'
        TEAM_CONTRIBUTION = 'TEAM_CONTRIBUTION', 'Team Project Contribution'
        ISSUE_VALIDATED = 'ISSUE_VALIDATED', 'Classroom Issue Validated'
        PRESIDENT_BONUS = 'PRESIDENT_BONUS', 'President Commendation'
        ADJUSTMENT_REVERSAL = 'ADJUSTMENT_REVERSAL', 'Correction or Reversal'

    student = models.ForeignKey(StudentProfile, on_delete=models.CASCADE, related_name='ledger_entries')
    points = models.IntegerField(help_text="Points awarded (positive) or adjusted (negative)")
    reason = models.CharField(max_length=255)
    rule_code = models.CharField(max_length=50, choices=RuleCode.choices, default=RuleCode.ACHIEVEMENT_VERIFIED)
    
    # Optional relationship to achievement
    achievement = models.ForeignKey('achievements.Achievement', on_delete=models.SET_NULL, null=True, blank=True, related_name='ledger_awards')
    awarded_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='granted_points')
    
    idempotency_key = models.CharField(max_length=150, unique=True, db_index=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        sign = "+" if self.points >= 0 else ""
        return f"{self.student.roll_number}: {sign}{self.points} pts ({self.reason})"
