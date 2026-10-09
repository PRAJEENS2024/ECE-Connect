from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from .models import User, StudentProfile, FacultyProfile, Announcement, Notification, AuditLog, ETLJobRun
from .serializers import (
    UserSerializer, StudentProfileSerializer, FacultyProfileSerializer,
    AnnouncementSerializer, NotificationSerializer, AuditLogSerializer, ETLJobRunSerializer
)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def auth_login(request):
    username = request.data.get('username')
    password = request.data.get('password')
    
    # Try finding user directly for demo/convenience
    user = authenticate(request, username=username, password=password)
    if not user:
        # Fallback check if username exists for passwordless demo mode
        user = User.objects.filter(username=username).first()
        if not user or not user.check_password(password):
            return Response({'error': 'Invalid username or password'}, status=status.HTTP_400_BAD_REQUEST)

    login(request, user)
    user_data = UserSerializer(user).data
    profile_data = None
    if user.is_student and hasattr(user, 'student_profile'):
        profile_data = StudentProfileSerializer(user.student_profile).data
    elif user.is_faculty and hasattr(user, 'faculty_profile'):
        profile_data = FacultyProfileSerializer(user.faculty_profile).data

    return Response({
        'token': str(user.id),
        'user': user_data,
        'profile': profile_data,
    })


@api_view(['POST'])
def auth_logout(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
def current_user(request):
    if not request.user or not request.user.is_authenticated:
        # Default to first student for easy demonstration
        student_user = User.objects.filter(role=User.Role.STUDENT).first()
        if student_user:
            user = student_user
        else:
            return Response({'authenticated': False}, status=status.HTTP_200_OK)
    else:
        user = request.user

    user_data = UserSerializer(user).data
    profile_data = None
    if hasattr(user, 'student_profile'):
        profile_data = StudentProfileSerializer(user.student_profile).data
    elif hasattr(user, 'faculty_profile'):
        profile_data = FacultyProfileSerializer(user.faculty_profile).data

    return Response({
        'authenticated': True,
        'user': user_data,
        'profile': profile_data,
    })


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def list_demo_users(request):
    """Convenient endpoint to retrieve available test users for quick role switching."""
    users = User.objects.all().order_by('role', 'username')
    data = []
    for u in users:
        role_label = u.get_role_display()
        sub = ""
        if hasattr(u, 'student_profile'):
            sub = f"Roll: {u.student_profile.roll_number} | Sem {u.student_profile.semester}"
        elif hasattr(u, 'faculty_profile'):
            sub = f"{u.faculty_profile.designation} | Cabin {u.faculty_profile.cabin_number}"
        
        data.append({
            'id': u.id,
            'username': u.username,
            'name': u.get_full_name() or u.username,
            'role': u.role,
            'role_label': role_label,
            'details': sub,
        })
    return Response(data)


class AnnouncementViewSet(viewsets.ModelViewSet):
    queryset = Announcement.objects.all()
    serializer_class = AnnouncementSerializer

    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return [permissions.AllowAny()]

    def perform_create(self, serializer):
        serializer.save(author=self.request.user)


class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        if self.request.user and self.request.user.is_authenticated:
            return Notification.objects.filter(recipient=self.request.user)
        # Fallback to notifications of first user
        first_user = User.objects.first()
        if first_user:
            return Notification.objects.filter(recipient=first_user)
        return Notification.objects.none()

    @action(detail=True, methods=['post'])
    def mark_as_read(self, request, pk=None):
        notif = self.get_object()
        notif.is_read = True
        notif.save()
        return Response({'status': 'marked as read'})

    @action(detail=False, methods=['post'])
    def mark_all_read(self, request):
        qs = self.get_queryset()
        qs.update(is_read=True)
        return Response({'status': 'all marked as read'})


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.AllowAny]
