from django.db import models
from django.utils import timezone
from core.models import User, FacultyProfile


class DepartmentQuery(models.Model):
    class Category(models.TextChoices):
        ACADEMIC = 'ACADEMIC', 'Academic & Curriculum'
        TIMETABLE = 'TIMETABLE', 'Timetable & Class Clashes'
        FACULTY_MEETING = 'FACULTY_MEETING', 'Faculty Meeting Request'
        HACKATHON_EVENT = 'HACKATHON_EVENT', 'Hackathon / Competition Support'
        INFRASTRUCTURE = 'INFRASTRUCTURE', 'Department Infrastructure'
        DEPARTMENT_ACTIVITY = 'DEPARTMENT_ACTIVITY', 'Association / Club Activities'
        SUGGESTION = 'SUGGESTION', 'Constructive Suggestion'
        TECHNICAL_PROBLEM = 'TECHNICAL_PROBLEM', 'Lab / Equipment Guidance'
        OTHER = 'OTHER', 'General Department Inquiry'

    class Status(models.TextChoices):
        SUBMITTED = 'SUBMITTED', 'Submitted'
        UNDER_REVIEW = 'UNDER_REVIEW', 'Under Department Review'
        ASSIGNED = 'ASSIGNED', 'Assigned to Faculty / Staff'
        RESPONSE_PROVIDED = 'RESPONSE_PROVIDED', 'Response Provided'
        WAITING_FOR_STUDENT = 'WAITING_FOR_STUDENT', 'Waiting for Student Clarification'
        RESOLVED = 'RESOLVED', 'Resolved'
        CLOSED = 'CLOSED', 'Closed'

    reference_id = models.CharField(max_length=32, unique=True, db_index=True)
    student = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='submitted_queries')
    is_anonymous = models.BooleanField(default=False)
    category = models.CharField(max_length=30, choices=Category.choices, default=Category.ACADEMIC)
    
    subject = models.CharField(max_length=200)
    description = models.TextField()
    target_faculty = models.ForeignKey(FacultyProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='addressed_queries')
    
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.SUBMITTED, db_index=True)
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_department_queries')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.reference_id:
            year = timezone.now().year
            count = DepartmentQuery.objects.count() + 1
            self.reference_id = f"ECE-QRY-{year}-{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.reference_id}] {self.subject} ({self.get_status_display()})"


class QueryResponse(models.Model):
    query = models.ForeignKey(DepartmentQuery, on_delete=models.CASCADE, related_name='responses')
    responder = models.ForeignKey(User, on_delete=models.CASCADE, related_name='query_replies')
    response_text = models.TextField()
    is_internal_note = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"Response to {self.query.reference_id} by {self.responder.get_full_name()}"
