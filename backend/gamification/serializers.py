from rest_framework import serializers
from .models import Badge, StudentBadge, PointLedger
from core.models import StudentProfile


class BadgeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Badge
        fields = '__all__'


class StudentBadgeSerializer(serializers.ModelSerializer):
    badge_name = serializers.CharField(source='badge.name', read_only=True)
    badge_description = serializers.CharField(source='badge.description', read_only=True)
    badge_icon = serializers.CharField(source='badge.icon_name', read_only=True)
    badge_color = serializers.CharField(source='badge.color', read_only=True)

    class Meta:
        model = StudentBadge
        fields = ['id', 'student', 'badge', 'badge_name', 'badge_description', 'badge_icon', 'badge_color', 'awarded_at', 'note']


class PointLedgerSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    roll_number = serializers.CharField(source='student.roll_number', read_only=True)
    awarded_by_name = serializers.CharField(source='awarded_by.get_full_name', read_only=True)

    class Meta:
        model = PointLedger
        fields = [
            'id', 'student', 'student_name', 'roll_number', 'points', 'reason',
            'rule_code', 'achievement', 'awarded_by_name', 'idempotency_key', 'created_at'
        ]


class LeaderboardEntrySerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='user.get_full_name', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    earned_badges = StudentBadgeSerializer(many=True, read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'student_name', 'username', 'roll_number', 'year_of_study', 'semester', 'section',
            'total_points', 'verified_achievements_count', 'hackathons_count', 'earned_badges'
        ]
