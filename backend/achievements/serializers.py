from rest_framework import serializers
from .models import EventCategory, Achievement, TeamMember, AchievementEvidence
from core.models import StudentProfile


class EventCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = EventCategory
        fields = '__all__'


class TeamMemberSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    roll_number = serializers.CharField(source='student.roll_number', read_only=True)

    class Meta:
        model = TeamMember
        fields = ['id', 'achievement', 'student', 'student_name', 'roll_number', 'external_name', 'role_description', 'points_awarded']

    def get_student_name(self, obj):
        if obj.student and obj.student.user:
            return obj.student.user.get_full_name()
        return obj.external_name or 'Team Member'


class AchievementEvidenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = AchievementEvidence
        fields = ['id', 'achievement', 'evidence_type', 'file', 'external_url', 'caption', 'uploaded_at']


class AchievementSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='student.user.get_full_name', read_only=True)
    roll_number = serializers.CharField(source='student.roll_number', read_only=True)
    year_of_study = serializers.IntegerField(source='student.year_of_study', read_only=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    level_label = serializers.CharField(source='get_achievement_level_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    team_members = TeamMemberSerializer(many=True, read_only=True)
    evidence = AchievementEvidenceSerializer(many=True, read_only=True)

    class Meta:
        model = Achievement
        fields = [
            'id', 'student', 'student_name', 'roll_number', 'year_of_study',
            'title', 'event_name', 'category', 'category_name', 'organizer', 'event_date',
            'is_team', 'team_name', 'achievement_level', 'level_label', 'points_awarded',
            'description', 'skills_used', 'event_website', 'status', 'status_label',
            'reviewed_by', 'reviewed_by_name', 'reviewed_at', 'reviewer_feedback',
            'student_confirmed', 'created_at', 'updated_at', 'team_members', 'evidence'
        ]


class AchievementCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Achievement
        fields = [
            'id', 'title', 'event_name', 'category', 'organizer', 'event_date',
            'is_team', 'team_name', 'achievement_level', 'description',
            'skills_used', 'event_website', 'student_confirmed'
        ]
