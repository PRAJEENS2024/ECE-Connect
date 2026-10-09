from django.db import models
from django.utils import timezone


class DailyEngagementMetric(models.Model):
    date = models.DateField(unique=True, db_index=True)
    active_users = models.IntegerField(default=0)
    achievements_submitted = models.IntegerField(default=0)
    achievements_verified = models.IntegerField(default=0)
    issues_reported = models.IntegerField(default=0)
    issues_resolved = models.IntegerField(default=0)
    queries_submitted = models.IntegerField(default=0)
    points_awarded = models.IntegerField(default=0)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']

    def __str__(self):
        return f"Metrics for {self.date}: {self.active_users} active, {self.points_awarded} pts"


class CategoryAnalyticsSnapshot(models.Model):
    snapshot_date = models.DateField(default=timezone.now, db_index=True)
    category_type = models.CharField(max_length=30)  # 'ACHIEVEMENT', 'ISSUE', 'QUERY'
    category_name = models.CharField(max_length=100)
    total_count = models.IntegerField(default=0)
    verified_or_resolved_count = models.IntegerField(default=0)

    class Meta:
        ordering = ['-snapshot_date', 'category_type']

    def __str__(self):
        return f"{self.category_type} - {self.category_name} ({self.total_count})"


class RoomIssueSummary(models.Model):
    room_number = models.CharField(max_length=50, unique=True)
    building = models.CharField(max_length=100, default='ECE Block')
    total_issues = models.IntegerField(default=0)
    open_issues = models.IntegerField(default=0)
    recurring_category = models.CharField(max_length=100, blank=True)
    last_reported_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.room_number}: {self.open_issues} open / {self.total_issues} total"
