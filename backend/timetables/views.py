from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.db.models import Q
from .models import AcademicYear, ClassSection, Room, Subject, TimetableEntry, FacultyAvailability, ScheduleException
from core.models import FacultyProfile
from .serializers import (
    ClassSectionSerializer, RoomSerializer, SubjectSerializer, TimetableEntrySerializer,
    FacultyAvailabilitySerializer, ScheduleExceptionSerializer, FacultyDirectorySerializer,
    calculate_expected_location
)


class ClassSectionViewSet(viewsets.ModelViewSet):
    queryset = ClassSection.objects.all()
    serializer_class = ClassSectionSerializer
    permission_classes = [permissions.AllowAny]


class RoomViewSet(viewsets.ModelViewSet):
    queryset = Room.objects.all().order_by('building', 'floor', 'room_number')
    serializer_class = RoomSerializer
    permission_classes = [permissions.AllowAny]


class SubjectViewSet(viewsets.ModelViewSet):
    queryset = Subject.objects.all().order_by('code')
    serializer_class = SubjectSerializer
    permission_classes = [permissions.AllowAny]


class TimetableEntryViewSet(viewsets.ModelViewSet):
    queryset = TimetableEntry.objects.all().select_related('class_section', 'subject', 'faculty__user', 'room')
    serializer_class = TimetableEntrySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        section_id = self.request.query_params.get('section')
        faculty_id = self.request.query_params.get('faculty')
        day = self.request.query_params.get('day')
        room_id = self.request.query_params.get('room')

        if section_id:
            qs = qs.filter(class_section_id=section_id)
        if faculty_id:
            qs = qs.filter(faculty_id=faculty_id)
        if day is not None:
            qs = qs.filter(day_of_week=day)
        if room_id:
            qs = qs.filter(room_id=room_id)
        return qs


class FacultyDirectoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = FacultyProfile.objects.all().select_related('user').prefetch_related('timetable_entries__subject')
    serializer_class = FacultyDirectorySerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        search = self.request.query_params.get('search')
        if search:
            qs = qs.filter(
                Q(user__first_name__icontains=search) |
                Q(user__last_name__icontains=search) |
                Q(specialization__icontains=search) |
                Q(cabin_number__icontains=search) |
                Q(designation__icontains=search)
            )
        return qs

    @action(detail=True, methods=['get'])
    def schedule(self, request, pk=None):
        faculty = self.get_object()
        entries = TimetableEntry.objects.filter(faculty=faculty).select_related('class_section', 'subject', 'room').order_by('day_of_week', 'start_time')
        
        # Group by day
        schedule_by_day = {i: [] for i in range(6)}
        for entry in entries:
            schedule_by_day[entry.day_of_week].append(TimetableEntrySerializer(entry).data)

        expected = calculate_expected_location(faculty)

        return Response({
            'faculty': FacultyDirectorySerializer(faculty).data,
            'expected_location': expected,
            'weekly_schedule': schedule_by_day,
        })


class FacultyAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = FacultyAvailability.objects.all().select_related('faculty__user')
    serializer_class = FacultyAvailabilitySerializer
    permission_classes = [permissions.AllowAny]


class ScheduleExceptionViewSet(viewsets.ModelViewSet):
    queryset = ScheduleException.objects.all().select_related('timetable_entry', 'substitute_faculty__user', 'substitute_room')
    serializer_class = ScheduleExceptionSerializer
    permission_classes = [permissions.AllowAny]


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def class_timetable_matrix(request, section_id):
    """Returns the weekly timetable matrix formatted for the grid component."""
    section = ClassSection.objects.filter(id=section_id).first()
    if not section:
        return Response({'error': 'Section not found'}, status=status.HTTP_404_NOT_FOUND)

    entries = TimetableEntry.objects.filter(class_section=section).select_related('subject', 'faculty__user', 'room').order_by('day_of_week', 'start_time')
    
    # Days 0..5 (Mon..Sat)
    matrix = {day: [] for day in range(6)}
    for entry in entries:
        matrix[entry.day_of_week].append(TimetableEntrySerializer(entry).data)

    return Response({
        'class_section': ClassSectionSerializer(section).data,
        'schedule': matrix,
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def validate_timetable_conflict(request):
    """Dry-run endpoint to test conflict before submitting."""
    serializer = TimetableEntrySerializer(data=request.data)
    if serializer.is_valid():
        return Response({'valid': True, 'message': 'No conflicts found.'})
    return Response({'valid': False, 'errors': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)
