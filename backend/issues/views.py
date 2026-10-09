from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from django.utils import timezone
from .models import IssueReport, IssueTimeline, IssueAttachment
from .serializers import IssueReportSerializer, IssueCreateSerializer, IssueTimelineSerializer, IssueAttachmentSerializer
from core.models import User, Notification
from gamification.services import award_points_to_student
from gamification.models import PointLedger


class IssueReportViewSet(viewsets.ModelViewSet):
    queryset = IssueReport.objects.all().select_related('reported_by', 'assigned_to', 'room').prefetch_related('timeline__actor', 'attachments')
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return IssueCreateSerializer
        return IssueReportSerializer

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        priority = self.request.query_params.get('priority')
        status_filter = self.request.query_params.get('status')
        room_id = self.request.query_params.get('room')
        building = self.request.query_params.get('building')
        user_only = self.request.query_params.get('my_issues')
        search = self.request.query_params.get('search')

        if category:
            qs = qs.filter(category=category)
        if priority:
            qs = qs.filter(priority=priority)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if room_id:
            qs = qs.filter(room_id=room_id)
        if building:
            qs = qs.filter(building=building)
        if user_only and self.request.user and self.request.user.is_authenticated:
            qs = qs.filter(reported_by=self.request.user)
        if search:
            qs = qs.filter(
                Q(title__icontains=search) |
                Q(description__icontains=search) |
                Q(item_equipment__icontains=search) |
                Q(reference_id__icontains=search) |
                Q(room__room_number__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        user = self.request.user
        if not (user and user.is_authenticated):
            user = User.objects.filter(role=User.Role.STUDENT).first()

        issue = serializer.save(reported_by=user, status=IssueReport.Status.SUBMITTED)

        # Create initial timeline log
        IssueTimeline.objects.create(
            issue=issue,
            actor=user,
            action="ISSUE_SUBMITTED",
            new_status=IssueReport.Status.SUBMITTED,
            note="Issue reported by student."
        )

        # Increment student counter if student
        if hasattr(user, 'student_profile'):
            user.student_profile.classroom_issues_count += 1
            user.student_profile.save()

        # Notify department coordinators/president
        presidents = User.objects.filter(role__in=[User.Role.PRESIDENT, User.Role.ADMIN])
        for p in presidents:
            Notification.objects.create(
                recipient=p,
                title=f"New Issue Reported: {issue.reference_id}",
                message=f"{issue.get_priority_display()} priority issue in {issue.room.room_number if issue.room else issue.building}: {issue.title}",
                notification_type=Notification.NotificationType.ISSUE,
                link=f"/issues/{issue.id}"
            )

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        issue = self.get_object()
        new_status = request.data.get('status')
        note = request.data.get('note', '')
        user = request.user if (request.user and request.user.is_authenticated) else User.objects.filter(role__in=[User.Role.ADMIN, User.Role.PRESIDENT]).first()

        if new_status not in [c[0] for c in IssueReport.Status.choices]:
            return Response({'error': f'Invalid status: {new_status}'}, status=status.HTTP_400_BAD_REQUEST)

        old_status = issue.status
        issue.status = new_status
        if new_status == IssueReport.Status.RESOLVED:
            issue.resolved_at = timezone.now()
            issue.resolution_notes = note
        issue.save()

        # Record in timeline
        IssueTimeline.objects.create(
            issue=issue,
            actor=user,
            action="STATUS_UPDATED",
            old_status=old_status,
            new_status=new_status,
            note=note
        )

        # Notify reporter
        Notification.objects.create(
            recipient=issue.reported_by,
            title=f"Issue {issue.reference_id} Status: {issue.get_status_display()}",
            message=f"Status changed from {old_status} to {new_status}. Note: {note or 'Updated by department.'}",
            notification_type=Notification.NotificationType.ISSUE,
            link=f"/issues/{issue.id}"
        )

        # If validated and resolved, award community helper points
        if new_status == IssueReport.Status.RESOLVED and hasattr(issue.reported_by, 'student_profile'):
            award_points_to_student(
                student_profile=issue.reported_by.student_profile,
                points=15,
                reason=f"Validated classroom maintenance report: {issue.reference_id}",
                rule_code=PointLedger.RuleCode.ISSUE_VALIDATED,
                actor=user,
                idempotency_key=f"ISSUE-{issue.id}-REWARD"
            )

        return Response(IssueReportSerializer(issue).data)

    @action(detail=True, methods=['post'])
    def assign_technician(self, request, pk=None):
        issue = self.get_object()
        user_id = request.data.get('assigned_to')
        user = User.objects.filter(id=user_id).first()
        actor = request.user if (request.user and request.user.is_authenticated) else User.objects.filter(role__in=[User.Role.ADMIN, User.Role.PRESIDENT]).first()

        issue.assigned_to = user
        issue.status = IssueReport.Status.ASSIGNED
        issue.save()

        IssueTimeline.objects.create(
            issue=issue,
            actor=actor,
            action="ASSIGNED",
            new_status=IssueReport.Status.ASSIGNED,
            note=f"Assigned to {user.get_full_name() if user else 'Technician'}"
        )

        return Response(IssueReportSerializer(issue).data)
