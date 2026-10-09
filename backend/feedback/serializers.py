from rest_framework import serializers
from .models import DepartmentQuery, QueryResponse


class QueryResponseSerializer(serializers.ModelSerializer):
    responder_name = serializers.CharField(source='responder.get_full_name', read_only=True)
    responder_role = serializers.CharField(source='responder.get_role_display', read_only=True)

    class Meta:
        model = QueryResponse
        fields = ['id', 'query', 'responder', 'responder_name', 'responder_role', 'response_text', 'is_internal_note', 'created_at']


class DepartmentQuerySerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    category_label = serializers.CharField(source='get_category_display', read_only=True)
    status_label = serializers.CharField(source='get_status_display', read_only=True)
    target_faculty_name = serializers.CharField(source='target_faculty.user.get_full_name', read_only=True)
    responses = QueryResponseSerializer(many=True, read_only=True)

    class Meta:
        model = DepartmentQuery
        fields = [
            'id', 'reference_id', 'student', 'student_name', 'is_anonymous', 'category', 'category_label',
            'subject', 'description', 'target_faculty', 'target_faculty_name', 'status', 'status_label',
            'assigned_to', 'created_at', 'updated_at', 'responses'
        ]
        read_only_fields = ['id', 'reference_id', 'created_at', 'updated_at']

    def get_student_name(self, obj):
        if obj.is_anonymous:
            # Check if viewer is admin or president
            request = self.context.get('request')
            if request and request.user and request.user.is_authenticated and request.user.is_admin_or_president:
                return f"{obj.student.get_full_name() if obj.student else 'Anonymous'} (Submitted Anonymously)"
            return "Anonymous Student"
        return obj.student.get_full_name() if obj.student else 'Anonymous'


class DepartmentQueryCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = DepartmentQuery
        fields = ['id', 'category', 'subject', 'description', 'target_faculty', 'is_anonymous']
