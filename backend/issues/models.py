from django.db import models
from django.utils import timezone
from core.models import User
from timetables.models import Room


class IssueReport(models.Model):
    class Category(models.TextChoices):
        FAN_VENTILATION = 'FAN_VENTILATION', 'Fan / Air Circulation / AC'
        LIGHTING = 'LIGHTING', 'Tube Light / Electrical Lighting'
        PROJECTOR_DISPLAY = 'PROJECTOR_DISPLAY', 'Projector / HDMI / AV Display'
        LAB_EQUIPMENT = 'LAB_EQUIPMENT', 'Lab Kits / Oscilloscope / Power Supply'
        MARKER_WHITEBOARD = 'MARKER_WHITEBOARD', 'Whiteboard / Markers Missing'
        DUSTER_SUPPLIES = 'DUSTER_SUPPLIES', 'Duster / Cleaning Supplies Missing'
        FURNITURE = 'FURNITURE', 'Broken Benches / Desks / Podiums'
        ELECTRICAL = 'ELECTRICAL', 'Switchboard / Loose Wiring / Power Sockets'
        CLEANLINESS = 'CLEANLINESS', 'Room Cleanliness / Waste Bin'
        NETWORK_WIFI = 'NETWORK_WIFI', 'Campus Wi-Fi / LAN Port'
        OTHER = 'OTHER', 'Other Infrastructure Maintenance'

    class Priority(models.TextChoices):
        LOW = 'LOW', 'Low'
        MEDIUM = 'MEDIUM', 'Medium'
        HIGH = 'HIGH', 'High'
        URGENT = 'URGENT', 'Urgent / Safety Hazard'

    class Status(models.TextChoices):
        SUBMITTED = 'SUBMITTED', 'Submitted'
        ACKNOWLEDGED = 'ACKNOWLEDGED', 'Acknowledged by Department'
        ASSIGNED = 'ASSIGNED', 'Assigned to Technician/Staff'
        IN_PROGRESS = 'IN_PROGRESS', 'Work in Progress'
        WAITING_FOR_PARTS = 'WAITING_FOR_PARTS', 'Waiting for Parts/Supplies'
        RESOLVED = 'RESOLVED', 'Resolved & Restored'
        REOPENED = 'REOPENED', 'Reopened'
        CLOSED = 'CLOSED', 'Closed'

    reference_id = models.CharField(max_length=32, unique=True, db_index=True)
    reported_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reported_issues')
    category = models.CharField(max_length=30, choices=Category.choices, default=Category.PROJECTOR_DISPLAY)
    
    building = models.CharField(max_length=100, default='ECE Block')
    floor = models.IntegerField(default=2)
    room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='reported_issues')
    room_number_text = models.CharField(max_length=50, blank=True)
    item_equipment = models.CharField(max_length=100, default='Ceiling Fan / Projector')

    title = models.CharField(max_length=200)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=Priority.choices, default=Priority.MEDIUM)
    status = models.CharField(max_length=25, choices=Status.choices, default=Status.SUBMITTED, db_index=True)
    
    assigned_to = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='assigned_issues')
    resolution_notes = models.TextField(blank=True)
    resolved_at = models.DateTimeField(null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def save(self, *args, **kwargs):
        if not self.reference_id:
            # Generate sequential reference id e.g. ECE-ISS-2026-0001
            year = timezone.now().year
            count = IssueReport.objects.count() + 1
            self.reference_id = f"ECE-ISS-{year}-{count:04d}"
        super().save(*args, **kwargs)

    def __str__(self):
        return f"[{self.reference_id}] {self.title} ({self.get_status_display()})"


class IssueTimeline(models.Model):
    issue = models.ForeignKey(IssueReport, on_delete=models.CASCADE, related_name='timeline')
    actor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=100)
    old_status = models.CharField(max_length=30, blank=True)
    new_status = models.CharField(max_length=30, blank=True)
    note = models.TextField(blank=True)
    is_internal = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['created_at']

    def __str__(self):
        return f"{self.issue.reference_id} - {self.action} by {self.actor}"


class IssueAttachment(models.Model):
    issue = models.ForeignKey(IssueReport, on_delete=models.CASCADE, related_name='attachments')
    file = models.FileField(upload_to='issues/attachments/')
    caption = models.CharField(max_length=255, blank=True)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Attachment for {self.issue.reference_id}"
