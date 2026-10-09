from django.db import models
from django.core.exceptions import ValidationError
from django.utils import timezone
from core.models import FacultyProfile


class AcademicYear(models.Model):
    name = models.CharField(max_length=20, unique=True)  # e.g. "2026-2027"
    is_current = models.BooleanField(default=True)

    def __str__(self):
        return self.name


class ClassSection(models.Model):
    name = models.CharField(max_length=50, unique=True)  # e.g. "ECE-III-A"
    year_of_study = models.IntegerField(choices=[(1, '1st Year'), (2, '2nd Year'), (3, '3rd Year'), (4, '4th Year')])
    semester = models.IntegerField(choices=[(i, f'Semester {i}') for i in range(1, 9)])
    section = models.CharField(max_length=5, default='A')

    class Meta:
        ordering = ['year_of_study', 'semester', 'section']

    def __str__(self):
        return f"{self.name} (Sem {self.semester})"


class Room(models.Model):
    class RoomType(models.TextChoices):
        CLASSROOM = 'CLASSROOM', 'Classroom'
        LABORATORY = 'LABORATORY', 'Laboratory / Workshop'
        SEMINAR_HALL = 'SEMINAR_HALL', 'Seminar Hall'
        FACULTY_CABIN = 'FACULTY_CABIN', 'Faculty Cabin'
        CONFERENCE_ROOM = 'CONFERENCE_ROOM', 'Conference Room'

    room_number = models.CharField(max_length=50, unique=True, db_index=True)  # e.g. "EC-204", "DSP-Lab"
    building = models.CharField(max_length=100, default='ECE Block')
    floor = models.IntegerField(default=2)
    room_type = models.CharField(max_length=30, choices=RoomType.choices, default=RoomType.CLASSROOM)
    capacity = models.IntegerField(default=65)

    def __str__(self):
        return f"{self.room_number} ({self.building}, Floor {self.floor})"


class Subject(models.Model):
    code = models.CharField(max_length=20, unique=True, db_index=True)  # e.g. "EC6401"
    name = models.CharField(max_length=150)  # e.g. "Digital Signal Processing"
    credits = models.IntegerField(default=4)
    is_lab = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.code} - {self.name}"


class TimetableEntry(models.Model):
    DAYS_OF_WEEK = [
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
    ]

    class_section = models.ForeignKey(ClassSection, on_delete=models.CASCADE, related_name='timetable_entries')
    subject = models.ForeignKey(Subject, on_delete=models.CASCADE, related_name='timetable_entries')
    faculty = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='timetable_entries')
    room = models.ForeignKey(Room, on_delete=models.CASCADE, related_name='timetable_entries')
    day_of_week = models.IntegerField(choices=DAYS_OF_WEEK)
    start_time = models.TimeField()
    end_time = models.TimeField()
    period_number = models.IntegerField(default=1)
    is_lab = models.BooleanField(default=False)

    class Meta:
        ordering = ['day_of_week', 'start_time']
        verbose_name_plural = 'Timetable entries'

    def clean(self):
        if self.start_time and self.end_time and self.start_time >= self.end_time:
            raise ValidationError("Start time must be strictly before end time.")

        # Check Room Conflict: same day, same room, overlapping times
        room_conflicts = TimetableEntry.objects.filter(
            day_of_week=self.day_of_week,
            room=self.room,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        )
        if self.pk:
            room_conflicts = room_conflicts.exclude(pk=self.pk)
        if room_conflicts.exists():
            conflict = room_conflicts.first()
            raise ValidationError(
                f"Room Conflict: {self.room.room_number} is already occupied by {conflict.subject.name} "
                f"({conflict.class_section.name}) from {conflict.start_time.strftime('%H:%M')} to {conflict.end_time.strftime('%H:%M')}."
            )

        # Check Faculty Conflict: same day, same faculty, overlapping times
        faculty_conflicts = TimetableEntry.objects.filter(
            day_of_week=self.day_of_week,
            faculty=self.faculty,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        )
        if self.pk:
            faculty_conflicts = faculty_conflicts.exclude(pk=self.pk)
        if faculty_conflicts.exists():
            conflict = faculty_conflicts.first()
            raise ValidationError(
                f"Faculty Conflict: {self.faculty.user.get_full_name()} is already assigned to {conflict.subject.name} "
                f"in {conflict.room.room_number} ({conflict.start_time.strftime('%H:%M')} - {conflict.end_time.strftime('%H:%M')})."
            )

        # Check Section Conflict: same day, same class section, overlapping times
        section_conflicts = TimetableEntry.objects.filter(
            day_of_week=self.day_of_week,
            class_section=self.class_section,
            start_time__lt=self.end_time,
            end_time__gt=self.start_time,
        )
        if self.pk:
            section_conflicts = section_conflicts.exclude(pk=self.pk)
        if section_conflicts.exists():
            conflict = section_conflicts.first()
            raise ValidationError(
                f"Section Conflict: Class {self.class_section.name} already has {conflict.subject.name} "
                f"scheduled from {conflict.start_time.strftime('%H:%M')} to {conflict.end_time.strftime('%H:%M')}."
            )

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.get_day_of_week_display()} {self.start_time.strftime('%H:%M')}-{self.end_time.strftime('%H:%M')}: {self.subject.code} ({self.room.room_number})"


class FacultyAvailability(models.Model):
    class Status(models.TextChoices):
        AVAILABLE_IN_CABIN = 'AVAILABLE_IN_CABIN', 'Available in Cabin'
        ON_LEAVE = 'ON_LEAVE', 'On Leave'
        IN_MEETING = 'IN_MEETING', 'In Department Meeting'
        OFFICE_HOURS = 'OFFICE_HOURS', 'Office Hours'
        CUSTOM_LOCATION = 'CUSTOM_LOCATION', 'Custom Location'

    faculty = models.ForeignKey(FacultyProfile, on_delete=models.CASCADE, related_name='availability_updates')
    effective_date = models.DateField(default=timezone.now)
    start_time = models.TimeField()
    end_time = models.TimeField()
    status = models.CharField(max_length=30, choices=Status.choices, default=Status.AVAILABLE_IN_CABIN)
    custom_location = models.CharField(max_length=100, blank=True)
    note = models.CharField(max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-effective_date', 'start_time']

    def __str__(self):
        return f"{self.faculty.user.get_full_name()} on {self.effective_date}: {self.get_status_display()}"


class ScheduleException(models.Model):
    date = models.DateField()
    timetable_entry = models.ForeignKey(TimetableEntry, on_delete=models.CASCADE, related_name='exceptions', null=True, blank=True)
    is_cancelled = models.BooleanField(default=False)
    substitute_faculty = models.ForeignKey(FacultyProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name='substitutions')
    substitute_room = models.ForeignKey(Room, on_delete=models.SET_NULL, null=True, blank=True, related_name='substitutions')
    reason = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Exception on {self.date}: {self.reason}"
