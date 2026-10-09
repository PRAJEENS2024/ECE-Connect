from rest_framework import serializers
from .models import User, StudentProfile, FacultyProfile, Announcement, Notification, AuditLog, ETLJobRun


class UserSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'full_name', 'role', 'phone', 'is_active', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_full_name(self, obj):
        return obj.get_full_name() or obj.username


class StudentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = StudentProfile
        fields = [
            'id', 'user', 'roll_number', 'department', 'year_of_study', 'semester', 'section',
            'total_points', 'verified_achievements_count', 'hackathons_count', 'classroom_issues_count'
        ]
        read_only_fields = ['id', 'total_points', 'verified_achievements_count', 'hackathons_count']


class FacultyProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = FacultyProfile
        fields = [
            'id', 'user', 'faculty_id', 'department', 'designation', 'cabin_number',
            'office_hours', 'bio', 'specialization', 'phone', 'current_status', 'status_note', 'status_updated_at'
        ]


class AnnouncementSerializer(serializers.ModelSerializer):
    author_name = serializers.SerializerMethodField()

    class Meta:
        model = Announcement
        fields = ['id', 'title', 'content', 'author', 'author_name', 'priority', 'target_role', 'is_pinned', 'created_at']
        read_only_fields = ['id', 'created_at']

    def get_author_name(self, obj):
        return obj.author.get_full_name() if obj.author else 'Department Administration'


class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = ['id', 'recipient', 'title', 'message', 'link', 'is_read', 'notification_type', 'created_at']
        read_only_fields = ['id', 'created_at']


class AuditLogSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = AuditLog
        fields = ['id', 'actor', 'actor_name', 'action', 'target_model', 'target_id', 'details', 'ip_address', 'timestamp']

    def get_actor_name(self, obj):
        return obj.actor.get_full_name() if obj.actor else 'System'


class ETLJobRunSerializer(serializers.ModelSerializer):
    class Meta:
        model = ETLJobRun
        fields = '__all__'
