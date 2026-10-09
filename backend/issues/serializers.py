from rest_framework import serializers
from .models import IssueReport, IssueTimeline, IssueAttachment
from timetables.serializers import RoomSerializer


class IssueTimelineSerializer(serializers.ModelSerializer):
    actor_name = serializers.SerializerMethodField()

    class Meta:
        model = IssueTimeline
        fields = ['id', 'issue', 'actor', 'actor_name', 'action', 'old_status', 'new_status', 'note', 'is_internal', 'created_at']

    def get_actor_name(self, obj):
        return obj.actor.get_full_name() if obj.actor else 'System'


class IssueAttachmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueAttachment
        fields = ['id', 'issue', 'file', 'caption', 'uploaded_at']


class IssueReportSerializer(serializers.ModelSerializer):
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    assigned_to_name = serializers.CharField(source='assigned_to.get_full_name', read_only=True)
    category_label = serializers.CharField(source='get_category_display', read_only=True)
    priority_label = serializers.CharField(source='get_priority_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    room_details = RoomSerializer(source='room', read_only=True)
    timeline = IssueTimelineSerializer(many=True, read_only=True)
    attachments = IssueAttachmentSerializer(many=True, read_only=True)

    class Meta:
        model = IssueReport
        fields = [
            'id', 'reference_id', 'reported_by', 'reported_by_name', 'category', 'category_label',
            'building', 'floor', 'room', 'room_number_text', 'room_details', 'item_equipment',
            'title', 'description', 'priority', 'priority_label', 'status', 'status_label',
            'assigned_to', 'assigned_to_name', 'resolution_notes', 'resolved_at',
            'created_at', 'updated_at', 'timeline', 'attachments'
        ]
        read_only_fields = ['id', 'reference_id', 'created_at', 'updated_at']


class IssueCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = IssueReport
        fields = [
            'id', 'category', 'building', 'floor', 'room', 'room_number_text',
            'item_equipment', 'title', 'description', 'priority'
        ]
