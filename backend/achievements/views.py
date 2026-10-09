from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import EventCategory, Achievement, TeamMember, AchievementEvidence
from .serializers import (
    EventCategorySerializer, AchievementSerializer, AchievementCreateSerializer,
    TeamMemberSerializer, AchievementEvidenceSerializer
)
from core.models import StudentProfile, User, Notification
from gamification.services import award_points_to_student
from gamification.models import PointLedger


class EventCategoryViewSet(viewsets.ModelViewSet):
    queryset = EventCategory.objects.all()
    serializer_class = EventCategorySerializer
    permission_classes = [permissions.AllowAny]


class AchievementViewSet(viewsets.ModelViewSet):
    queryset = Achievement.objects.all().select_related('student__user', 'category', 'reviewed_by').prefetch_related('team_members__student__user', 'evidence')
    serializer_class = AchievementSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        category_id = self.request.query_params.get('category')
        status_filter = self.request.query_params.get('status')
        level_filter = self.request.query_params.get('level')
        student_id = self.request.query_params.get('student')
        year_filter = self.request.query_params.get('year')
        search = self.request.query_params.get('search')

        if category_id:
            qs = qs.filter(category_id=category_id)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if level_filter:
            qs = qs.filter(achievement_level=level_filter)
        if student_id:
            qs = qs.filter(student_id=student_id)
        if year_filter:
            qs = qs.filter(student__year_of_study=year_filter)
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(event_name__icontains=search) |
                Q(organizer__icontains=search) |
                Q(student__user__first_name__icontains=search) |
                Q(student__user__last_name__icontains=search) |
                Q(student__roll_number__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        student = None
        if user and user.is_authenticated and hasattr(user, 'student_profile'):
            student = user.student_profile
        else:
            student = StudentProfile.objects.first()

        achievement = serializer.save(student=student, status=Achievement.Status.PENDING)

        # Notify administrators/president about new submission
        presidents = User.objects.filter(role__in=[User.Role.PRESIDENT, User.Role.ADMIN])
        for p in presidents:
            Notification.objects.create(
                recipient=p,
                title="New Achievement Submitted",
                message=f"{student.user.get_full_name()} submitted '{achievement.title}' for verification.",
                notification_type=Notification.NotificationType.ACHIEVEMENT,
                link=f"/achievements/{achievement.id}"
            )

    @action(detail=True, methods=['post'])
    def add_evidence(self, request, pk=None):
        achievement = self.get_object()
        file_obj = request.FILES.get('file')
        evidence_type = request.data.get('evidence_type', AchievementEvidence.EvidenceType.CERTIFICATE)
        external_url = request.data.get('external_url', '')
        caption = request.data.get('caption', '')

        # File validation
        if file_obj:
            if file_obj.size > 15 * 1024 * 1024:  # 15MB limit
                return Response({'error': 'File size exceeds maximum permitted 15MB limit.'}, status=status.HTTP_400_BAD_REQUEST)
            ext = file_obj.name.split('.')[-1].lower()
            allowed = ['pdf', 'png', 'jpg', 'jpeg', 'webp', 'mp4', 'mov']
            if ext not in allowed:
                return Response({'error': f'Unsupported file type .{ext}. Allowed: {", ".join(allowed)}'}, status=status.HTTP_400_BAD_REQUEST)

        evidence = AchievementEvidence.objects.create(
            achievement=achievement,
            evidence_type=evidence_type,
            file=file_obj,
            external_url=external_url,
            caption=caption
        )
        return Response(AchievementEvidenceSerializer(evidence).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def add_team_member(self, request, pk=None):
        achievement = self.get_object()
        student_id = request.data.get('student_id')
        external_name = request.data.get('external_name', '')
        role_description = request.data.get('role_description', 'Core Contributor')

        student = StudentProfile.objects.filter(id=student_id).first() if student_id else None
        member = TeamMember.objects.create(
            achievement=achievement,
            student=student,
            external_name=external_name,
            role_description=role_description
        )
        return Response(TeamMemberSerializer(member).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def review(self, request, pk=None):
        achievement = self.get_object()
        user = request.user
        
        # Enforce security rule: Students cannot approve achievements
        if user and user.is_authenticated and user.role == User.Role.STUDENT and not user.is_staff:
            return Response({'error': 'Unauthorized: Students cannot verify or review achievements.'}, status=status.HTTP_403_FORBIDDEN)

        reviewer = user if (user and user.is_authenticated) else User.objects.filter(role__in=[User.Role.ADMIN, User.Role.PRESIDENT]).first()
        
        action_type = request.data.get('action')  # 'APPROVE', 'REJECT', 'CHANGES_REQUESTED'
        feedback = request.data.get('feedback', '')
        points = request.data.get('points')

        if action_type == 'APPROVE':
            if points is None:
                points = achievement.calculate_suggested_points()
            else:
                points = int(points)

            achievement.status = Achievement.Status.APPROVED
            achievement.points_awarded = points
            achievement.reviewed_by = reviewer
            achievement.reviewed_at = timezone.now()
            achievement.reviewer_feedback = feedback
            achievement.save()

            # Award points via idempotent ledger
            idempotency_key = f"ACH-{achievement.id}-APPROVAL"
            award_points_to_student(
                student_profile=achievement.student,
                points=points,
                reason=f"Verified: {achievement.title} ({achievement.get_achievement_level_display()})",
                rule_code=PointLedger.RuleCode.ACHIEVEMENT_VERIFIED,
                achievement=achievement,
                actor=reviewer,
                idempotency_key=idempotency_key
            )

            # Award points to team members if configured
            if achievement.is_team:
                team_pts = max(10, int(points * 0.7))
                for member in achievement.team_members.all():
                    if member.student and member.student != achievement.student:
                        award_points_to_student(
                            student_profile=member.student,
                            points=team_pts,
                            reason=f"Team Member: {achievement.title}",
                            rule_code=PointLedger.RuleCode.TEAM_CONTRIBUTION,
                            achievement=achievement,
                            actor=reviewer,
                            idempotency_key=f"ACH-{achievement.id}-MEMBER-{member.student.id}"
                        )
                        member.points_awarded = team_pts
                        member.save()

            return Response({
                'message': 'Achievement approved and points awarded successfully.',
                'achievement': AchievementSerializer(achievement).data
            })

        elif action_type == 'REJECT':
            achievement.status = Achievement.Status.REJECTED
            achievement.reviewed_by = reviewer
            achievement.reviewed_at = timezone.now()
            achievement.reviewer_feedback = feedback
            achievement.save()

            Notification.objects.create(
                recipient=achievement.student.user,
                title="Achievement Status: Rejected",
                message=f"Your submission '{achievement.title}' was reviewed and rejected. Feedback: {feedback}",
                notification_type=Notification.NotificationType.ACHIEVEMENT,
                link=f"/achievements/{achievement.id}"
            )
            return Response({'message': 'Achievement rejected.', 'achievement': AchievementSerializer(achievement).data})

        elif action_type == 'CHANGES_REQUESTED':
            achievement.status = Achievement.Status.CHANGES_REQUESTED
            achievement.reviewed_by = reviewer
            achievement.reviewed_at = timezone.now()
            achievement.reviewer_feedback = feedback
            achievement.save()

            Notification.objects.create(
                recipient=achievement.student.user,
                title="Changes Requested on Achievement",
                message=f"Changes requested for '{achievement.title}': {feedback}",
                notification_type=Notification.NotificationType.ACHIEVEMENT,
                link=f"/achievements/{achievement.id}"
            )
            return Response({'message': 'Requested changes from student.', 'achievement': AchievementSerializer(achievement).data})

        return Response({'error': 'Invalid review action. Must be APPROVE, REJECT, or CHANGES_REQUESTED.'}, status=status.HTTP_400_BAD_REQUEST)
