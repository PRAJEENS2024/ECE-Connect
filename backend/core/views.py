import re
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes, action
from rest_framework.response import Response
from django.contrib.auth import authenticate, login, logout
from .models import User, StudentProfile, FacultyProfile, Announcement, Notification, AuditLog, ETLJobRun
from .serializers import (
    UserSerializer, StudentProfileSerializer, FacultyProfileSerializer,
    AnnouncementSerializer, NotificationSerializer, AuditLogSerializer, ETLJobRunSerializer
)

# Sri Eshwar College of Engineering (SECE) ECE Department email regex
# Format: ___ece@sece.ac.in (e.g. prajeen.s2024ece@sece.ac.in, hod.ece@sece.ac.in)
SECE_ECE_EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+ece@sece\.ac\.in$', re.IGNORECASE)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def auth_register(request):
    """
    Secure registration endpoint for ECE Department members.
    Requires:
    - username (alphanumeric/dot/underscore)
    - email (strictly matching ___ece@sece.ac.in)
    - password (min 6 chars)
    - role (STUDENT or FACULTY)
    - student fields: roll_number, year_of_study, semester, section
    - faculty fields: faculty_id, designation, cabin_number, specialization
    """
    data = request.data
    username = str(data.get('username', '')).strip().lower()
    email = str(data.get('email', '')).strip().lower()
    password = str(data.get('password', ''))
    first_name = str(data.get('first_name', '')).strip()
    last_name = str(data.get('last_name', '')).strip()
    role = str(data.get('role', 'STUDENT')).strip().upper()

    # 1. Validation
    if not username:
        return Response({'error': 'Username is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not email:
        return Response({'error': 'College email is required.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password or len(password) < 6:
        return Response({'error': 'Password must be at least 6 characters long.'}, status=status.HTTP_400_BAD_REQUEST)

    # 2. SECE ECE Email pattern validation
    if not SECE_ECE_EMAIL_REGEX.match(email):
        return Response({
            'error': "Invalid college email format. Must follow the SECE ECE institutional format: [identifier]ece@sece.ac.in (e.g., prajeen.s2024ece@sece.ac.in)."
        }, status=status.HTTP_400_BAD_REQUEST)

    # 3. Check uniqueness
    if User.objects.filter(username__iexact=username).exists():
        return Response({'error': f"The username '{username}' is already registered. Please choose another or sign in."}, status=status.HTTP_400_BAD_REQUEST)
    if User.objects.filter(email__iexact=email).exists():
        return Response({'error': f"An account with email '{email}' already exists. Please sign in."}, status=status.HTTP_400_BAD_REQUEST)

    # 4. Role normalization
    if role not in [User.Role.STUDENT, User.Role.FACULTY, User.Role.HOD, User.Role.ADMIN]:
        role = User.Role.STUDENT

    # 5. Role-specific validation
    roll_number = str(data.get('roll_number', '')).strip().upper()
    faculty_id = str(data.get('faculty_id', '')).strip().upper()

    if role == User.Role.STUDENT:
        if not roll_number:
            return Response({'error': 'Roll number is required for student registration (e.g. 24ECE001).'}, status=status.HTTP_400_BAD_REQUEST)
        if StudentProfile.objects.filter(roll_number__iexact=roll_number).exists():
            return Response({'error': f"Roll number '{roll_number}' is already registered."}, status=status.HTTP_400_BAD_REQUEST)
    elif role in [User.Role.FACULTY, User.Role.HOD]:
        if not faculty_id:
            return Response({'error': 'Faculty ID is required for professor registration (e.g. SECE-ECE-042).'}, status=status.HTTP_400_BAD_REQUEST)
        if FacultyProfile.objects.filter(faculty_id__iexact=faculty_id).exists():
            return Response({'error': f"Faculty ID '{faculty_id}' is already registered."}, status=status.HTTP_400_BAD_REQUEST)

    # 6. Create User
    user = User(
        username=username,
        email=email,
        first_name=first_name,
        last_name=last_name,
        role=role
    )
    user.set_password(password)
    user.save()

    # 7. Create Profile
    profile_data = None
    if role == User.Role.STUDENT:
        try:
            year_of_study = int(data.get('year_of_study', 3) or 3)
        except (ValueError, TypeError):
            year_of_study = 3
        try:
            semester = int(data.get('semester', 6) or 6)
        except (ValueError, TypeError):
            semester = 6
        section = str(data.get('section', 'A')).strip().upper() or 'A'

        sp = StudentProfile.objects.create(
            user=user,
            roll_number=roll_number,
            department='Electronics and Communication Engineering',
            year_of_study=year_of_study,
            semester=semester,
            section=section
        )
        profile_data = StudentProfileSerializer(sp).data
    else:
        designation = str(data.get('designation', 'Assistant Professor')).strip() or 'Assistant Professor'
        cabin_number = str(data.get('cabin_number', 'EC-301')).strip() or 'EC-301'
        specialization = str(data.get('specialization', 'Electronics & Communication')).strip()

        fp = FacultyProfile.objects.create(
            user=user,
            faculty_id=faculty_id,
            department='Electronics and Communication Engineering',
            designation=designation,
            cabin_number=cabin_number,
            specialization=specialization
        )
        profile_data = FacultyProfileSerializer(fp).data

    login(request, user)

    return Response({
        'token': str(user.id),
        'user': UserSerializer(user).data,
        'profile': profile_data,
        'message': f"Account registered successfully! Welcome to ECE Connect, {user.get_full_name() or user.username}."
    }, status=status.HTTP_201_CREATED)


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def auth_login(request):
    """
    Secure login endpoint.
    Requires username (or SECE email) and password every time.
    """
    identifier = str(request.data.get('username', '')).strip()
    password = str(request.data.get('password', ''))

    if not identifier:
        return Response({'error': 'Please enter your username or college email.'}, status=status.HTTP_400_BAD_REQUEST)
    if not password:
        return Response({'error': 'Please enter your password.'}, status=status.HTTP_400_BAD_REQUEST)

    # Lookup user by username or email
    user = None
    if '@' in identifier:
        user = User.objects.filter(email__iexact=identifier).first()
    else:
        user = User.objects.filter(username__iexact=identifier).first()

    if not user:
        return Response({'error': 'No account found matching this username or college email.'}, status=status.HTTP_400_BAD_REQUEST)

    # Verify password securely
    if not user.check_password(password):
        return Response({'error': 'Invalid credentials. Password is incorrect.'}, status=status.HTTP_400_BAD_REQUEST)

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
        'message': f"Welcome back, {user.get_full_name() or user.username}!"
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def auth_logout(request):
    logout(request)
    return Response({'message': 'Logged out successfully'})


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def current_user(request):
    # Check headers for client token/session ID
    user_id = request.headers.get('X-User-Id')
    auth_header = request.headers.get('Authorization', '')
    if not user_id and auth_header.startswith('Bearer '):
        token_val = auth_header.split(' ')[1].strip()
        if token_val and token_val != 'null' and token_val != 'undefined':
            user_id = token_val

    user = None
    if user_id:
        user = User.objects.filter(id=user_id).first()
    elif request.user and request.user.is_authenticated:
        user = request.user

    if not user:
        return Response({
            'authenticated': False,
            'user': None,
            'profile': None
        }, status=status.HTTP_200_OK)

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
    """Convenient endpoint to retrieve available test accounts and SECE credentials."""
    users = User.objects.all().order_by('role', 'username')
    data = []
    for u in users:
        role_label = u.get_role_display()
        sub = ""
        roll_or_id = ""
        if u.role == User.Role.HOD:
            role_label = "Head of Department (HOD)"
            sub = "Department Leadership & Executive Oversight"
            roll_or_id = u.faculty_profile.faculty_id if hasattr(u, 'faculty_profile') else "ECHOD01"
        elif u.role == User.Role.FACULTY:
            role_label = "Professor"
            sub = f"{u.faculty_profile.designation if hasattr(u, 'faculty_profile') else 'Faculty'} | Cabin {u.faculty_profile.cabin_number if hasattr(u, 'faculty_profile') else 'EC-304'}"
            roll_or_id = u.faculty_profile.faculty_id if hasattr(u, 'faculty_profile') else "ECFAC01"
        elif u.role == User.Role.STUDENT:
            role_label = "Student"
            sub = f"Roll: {u.student_profile.roll_number if hasattr(u, 'student_profile') else '21EC001'} | Sem {u.student_profile.semester if hasattr(u, 'student_profile') else 6}"
            roll_or_id = u.student_profile.roll_number if hasattr(u, 'student_profile') else "21EC001"
        elif u.role == User.Role.ADMIN:
            role_label = "Department Admin"
            sub = "Operations, Timetables & Security"
            roll_or_id = "ADMIN"
        elif u.role == User.Role.PRESIDENT:
            role_label = "Student President"
            sub = "Student Council & Event Coordination"
            roll_or_id = u.student_profile.roll_number if hasattr(u, 'student_profile') else "21EC001"

        data.append({
            'id': u.id,
            'username': u.username,
            'email': u.email,
            'name': u.get_full_name() or u.username,
            'role': u.role,
            'role_label': role_label,
            'details': sub,
            'identifier': roll_or_id,
            'suggested_password': 'password123'
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
