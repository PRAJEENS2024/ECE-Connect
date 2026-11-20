from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q
from .models import DepartmentQuery, QueryResponse
from .serializers import DepartmentQuerySerializer, DepartmentQueryCreateSerializer, QueryResponseSerializer
from core.models import User, Notification


class DepartmentQueryViewSet(viewsets.ModelViewSet):
    queryset = DepartmentQuery.objects.all().select_related('student', 'target_faculty__user', 'assigned_to').prefetch_related('responses__responder')
    permission_classes = [permissions.AllowAny]

    def get_serializer_class(self):
        if self.action == 'create':
            return DepartmentQueryCreateSerializer
        return DepartmentQuerySerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['request'] = self.request
        return context

    def get_queryset(self):
        qs = super().get_queryset()
        category = self.request.query_params.get('category')
        status_filter = self.request.query_params.get('status')
        faculty_id = self.request.query_params.get('faculty')
        my_queries = self.request.query_params.get('my_queries')
        search = self.request.query_params.get('search')

        if category:
            qs = qs.filter(category=category)
        if status_filter:
            qs = qs.filter(status=status_filter)
        if faculty_id:
            qs = qs.filter(target_faculty_id=faculty_id)
        if my_queries and self.request.user and self.request.user.is_authenticated:
            qs = qs.filter(student=self.request.user)
        if search:
            qs = qs.filter(
                Q(subject__icontains=search) |
                Q(description__icontains=search) |
                Q(reference_id__icontains=search)
            )
        return qs

    def perform_create(self, serializer):
        user = self.request.user if (self.request.user and self.request.user.is_authenticated) else User.objects.filter(role=User.Role.STUDENT).first()
        query = serializer.save(student=user, status=DepartmentQuery.Status.SUBMITTED)

        # Notify target faculty or coordinator
        recipient = query.target_faculty.user if query.target_faculty else User.objects.filter(role__in=[User.Role.PRESIDENT, User.Role.ADMIN, User.Role.HOD]).first()
        if recipient:
            Notification.objects.create(
                recipient=recipient,
                title=f"New Query: {query.reference_id}",
                message=f"Category: {query.get_category_display()} - {query.subject}",
                notification_type=Notification.NotificationType.QUERY,
                link=f"/feedback/{query.id}"
            )

    @action(detail=True, methods=['post'])
    def add_response(self, request, pk=None):
        query = self.get_object()
        user = request.user if (request.user and request.user.is_authenticated) else User.objects.filter(role__in=[User.Role.FACULTY, User.Role.ADMIN, User.Role.HOD]).first()
        response_text = request.data.get('response_text')
        is_internal = request.data.get('is_internal_note', False)

        if not response_text:
            return Response({'error': 'Response text cannot be empty'}, status=status.HTTP_400_BAD_REQUEST)

        resp = QueryResponse.objects.create(
            query=query,
            responder=user,
            response_text=response_text,
            is_internal_note=is_internal
        )

        if not is_internal:
            query.status = DepartmentQuery.Status.RESPONSE_PROVIDED
            query.save()

            if query.student:
                Notification.objects.create(
                    recipient=query.student,
                    title=f"Response Received for {query.reference_id}",
                    message=f"{user.get_full_name()} replied: {response_text[:100]}...",
                    notification_type=Notification.NotificationType.QUERY,
                    link=f"/feedback/{query.id}"
                )

        return Response(QueryResponseSerializer(resp).data, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        query = self.get_object()
        new_status = request.data.get('status')
        if new_status in [c[0] for c in DepartmentQuery.Status.choices]:
            query.status = new_status
            query.save()
            return Response(DepartmentQuerySerializer(query).data)
        return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
