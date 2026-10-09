from rest_framework import serializers
from django.utils import timezone
import datetime
from .models import AcademicYear, ClassSection, Room, Subject, TimetableEntry, FacultyAvailability, ScheduleException
from core.models import FacultyProfile


class ClassSectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ClassSection
        fields = '__all__'


class RoomSerializer(serializers.ModelSerializer):
    class Meta:
        model = Room
        fields = '__all__'


class SubjectSerializer(serializers.ModelSerializer):
    class Meta:
        model = Subject
        fields = '__all__'


class TimetableEntrySerializer(serializers.ModelSerializer):
    class_section_name = serializers.CharField(source='class_section.name', read_only=True)
    subject_code = serializers.CharField(source='subject.code', read_only=True)
    subject_name = serializers.CharField(source='subject.name', read_only=True)
    faculty_name = serializers.SerializerMethodField()
    faculty_cabin = serializers.CharField(source='faculty.cabin_number', read_only=True)
    room_number = serializers.CharField(source='room.room_number', read_only=True)
    room_building = serializers.CharField(source='room.building', read_only=True)
    room_floor = serializers.IntegerField(source='room.floor', read_only=True)
    day_name = serializers.CharField(source='get_day_of_week_display', read_only=True)

    class Meta:
        model = TimetableEntry
        fields = [
            'id', 'class_section', 'class_section_name', 'subject', 'subject_code', 'subject_name',
            'faculty', 'faculty_name', 'faculty_cabin', 'room', 'room_number', 'room_building', 'room_floor',
            'day_of_week', 'day_name', 'start_time', 'end_time', 'period_number', 'is_lab'
        ]

    def get_faculty_name(self, obj):
        return obj.faculty.user.get_full_name() if obj.faculty and obj.faculty.user else 'Faculty'

    def validate(self, attrs):
        # Validate conflict in serializer so frontend receives clean error messages
        start_time = attrs.get('start_time')
        end_time = attrs.get('end_time')
        day_of_week = attrs.get('day_of_week')
        room = attrs.get('room')
        faculty = attrs.get('faculty')
        class_section = attrs.get('class_section')
        instance_id = self.instance.pk if self.instance else None

        if start_time and end_time and start_time >= end_time:
            raise serializers.ValidationError("Start time must be before end time.")

        if day_of_week is not None and room and start_time and end_time:
            room_conflicts = TimetableEntry.objects.filter(
                day_of_week=day_of_week,
                room=room,
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if instance_id:
                room_conflicts = room_conflicts.exclude(pk=instance_id)
            if room_conflicts.exists():
                c = room_conflicts.first()
                raise serializers.ValidationError(
                    f"Room Conflict: Room {room.room_number} is already occupied by {c.subject.name} ({c.class_section.name}) from {c.start_time.strftime('%H:%M')} to {c.end_time.strftime('%H:%M')}."
                )

        if day_of_week is not None and faculty and start_time and end_time:
            faculty_conflicts = TimetableEntry.objects.filter(
                day_of_week=day_of_week,
                faculty=faculty,
                start_time__lt=end_time,
                end_time__gt=start_time,
            )
            if instance_id:
                faculty_conflicts = faculty_conflicts.exclude(pk=instance_id)
            if faculty_conflicts.exists():
                c = faculty_conflicts.first()
                raise serializers.ValidationError(
                    f"Faculty Conflict: {faculty.user.get_full_name()} is already booked for {c.subject.name} in {c.room.room_number} ({c.start_time.strftime('%H:%M')} to {c.end_time.strftime('%H:%M')})."
                )

        return attrs


class FacultyAvailabilitySerializer(serializers.ModelSerializer):
    class Meta:
        model = FacultyAvailability
        fields = '__all__'


class ScheduleExceptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduleException
        fields = '__all__'


def calculate_expected_location(faculty_profile, target_time=None, target_date=None):
    """
    Core business logic calculating expected faculty location.
    Explicitly labeled as 'Expected location based on timetable'.
    Never implies covert or physical GPS tracking.
    """
    now = timezone.localtime()
    current_time = target_time or now.time()
    current_date = target_date or now.date()
    day_of_week = current_date.weekday()  # 0=Monday .. 6=Sunday

    if day_of_week > 5:
        return {
            'status': 'WEEKEND',
            'status_label': 'Weekend',
            'expected_location': 'No Scheduled Activity',
            'detail': 'Sunday / Holiday',
            'is_timetable_derived': True,
            'confidence': 'HIGH',
            'disclaimer': 'Expected location based on academic schedule'
        }

    # 1. Check explicit faculty availability updates for today
    avail = FacultyAvailability.objects.filter(
        faculty=faculty_profile,
        effective_date=current_date,
        start_time__lte=current_time,
        end_time__gt=current_time
    ).first()

    if avail:
        if avail.status == FacultyAvailability.Status.ON_LEAVE:
            return {
                'status': 'ON_LEAVE',
                'status_label': 'On Leave',
                'expected_location': 'Not on Campus',
                'detail': avail.note or 'Authorized Leave',
                'is_timetable_derived': False,
                'disclaimer': 'Verified availability update'
            }
        elif avail.status == FacultyAvailability.Status.OFFICE_HOURS:
            return {
                'status': 'OFFICE_HOURS',
                'status_label': 'Open Office Hours',
                'expected_location': f"Cabin {faculty_profile.cabin_number}",
                'detail': avail.note or 'Available for student meetings',
                'is_timetable_derived': False,
                'disclaimer': 'Published faculty office hours'
            }
        elif avail.status == FacultyAvailability.Status.IN_MEETING:
            return {
                'status': 'IN_MEETING',
                'status_label': 'Department Meeting',
                'expected_location': 'ECE Conference Hall / HOD Cabin',
                'detail': avail.note or 'Scheduled Department Meeting',
                'is_timetable_derived': False,
                'disclaimer': 'Authorized department schedule'
            }
        elif avail.status == FacultyAvailability.Status.CUSTOM_LOCATION:
            return {
                'status': 'CUSTOM_LOCATION',
                'status_label': 'Custom Location',
                'expected_location': avail.custom_location or f"Cabin {faculty_profile.cabin_number}",
                'detail': avail.note or 'Special assignment',
                'is_timetable_derived': False,
                'disclaimer': 'Published faculty update'
            }

    # 2. Check timetable entries for current time slot
    entries = TimetableEntry.objects.filter(
        faculty=faculty_profile,
        day_of_week=day_of_week,
        start_time__lte=current_time,
        end_time__gt=current_time
    )

    if entries.count() > 1:
        # Conflict / Overlap condition detected
        return {
            'status': 'CONFLICT',
            'status_label': 'Timetable Conflict',
            'expected_location': 'Multiple simultaneous entries detected',
            'detail': 'Data quality alert: Multiple classes scheduled at this hour',
            'is_timetable_derived': True,
            'is_conflict': True,
            'disclaimer': 'Timetable data conflict needs coordinator resolution'
        }

    entry = entries.first()
    if entry:
        # Check for schedule exceptions (cancellation / substitution)
        exc = ScheduleException.objects.filter(timetable_entry=entry, date=current_date).first()
        if exc and exc.is_cancelled:
            return {
                'status': 'CLASS_CANCELLED',
                'status_label': 'Class Cancelled',
                'expected_location': f"Cabin {faculty_profile.cabin_number}",
                'detail': f"Session cancelled: {exc.reason}",
                'is_timetable_derived': True,
                'disclaimer': 'Expected location based on exception notice'
            }

        return {
            'status': 'IN_CLASS',
            'status_label': 'In Lecture / Lab',
            'expected_location': f"{entry.room.room_number} ({entry.room.building}, Floor {entry.room.floor})",
            'subject': f"{entry.subject.code} - {entry.subject.name}",
            'class_section': entry.class_section.name,
            'time_slot': f"{entry.start_time.strftime('%H:%M')} - {entry.end_time.strftime('%H:%M')}",
            'detail': f"Conducting {entry.subject.name} for {entry.class_section.name}",
            'is_timetable_derived': True,
            'disclaimer': 'Expected location based on published timetable'
        }

    # 3. If within college working hours (08:30 to 17:00), faculty is expected in cabin
    college_start = datetime.time(8, 30)
    college_end = datetime.time(17, 0)
    if college_start <= current_time <= college_end:
        # Look up next scheduled activity today
        next_entry = TimetableEntry.objects.filter(
            faculty=faculty_profile,
            day_of_week=day_of_week,
            start_time__gte=current_time
        ).order_by('start_time').first()

        next_str = "No further classes scheduled today"
        if next_entry:
            next_str = f"Next: {next_entry.subject.code} at {next_entry.start_time.strftime('%H:%M')} in {next_entry.room.room_number}"

        return {
            'status': 'AVAILABLE_IN_CABIN',
            'status_label': 'Free Period / In Cabin',
            'expected_location': f"Cabin {faculty_profile.cabin_number} (ECE Block)",
            'detail': next_str,
            'next_activity': next_str,
            'is_timetable_derived': True,
            'disclaimer': 'Expected location based on published timetable'
        }

    # Outside college hours
    return {
        'status': 'OFF_HOURS',
        'status_label': 'College Closed / Off Hours',
        'expected_location': 'Off Campus',
        'detail': 'Department working hours: 8:30 AM - 5:00 PM',
        'is_timetable_derived': True,
        'disclaimer': 'Outside scheduled academic hours'
    }


class FacultyDirectorySerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    expected_location = serializers.SerializerMethodField()
    subjects_taught = serializers.SerializerMethodField()

    class Meta:
        model = FacultyProfile
        fields = [
            'id', 'user_name', 'email', 'faculty_id', 'department', 'designation',
            'cabin_number', 'office_hours', 'bio', 'specialization', 'phone',
            'current_status', 'status_note', 'expected_location', 'subjects_taught'
        ]

    def get_expected_location(self, obj):
        return calculate_expected_location(obj)

    def get_subjects_taught(self, obj):
        return list(obj.timetable_entries.values_list('subject__name', flat=True).distinct())
