from rest_framework import viewsets, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from django.db.models import Sum
from .models import Badge, StudentBadge, PointLedger
from core.models import StudentProfile
from .serializers import BadgeSerializer, StudentBadgeSerializer, PointLedgerSerializer, LeaderboardEntrySerializer


class BadgeViewSet(viewsets.ModelViewSet):
    queryset = Badge.objects.all().order_by('criteria_value')
    serializer_class = BadgeSerializer
    permission_classes = [permissions.AllowAny]


class PointLedgerViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = PointLedger.objects.all().select_related('student__user', 'awarded_by', 'achievement')
    serializer_class = PointLedgerSerializer
    permission_classes = [permissions.AllowAny]

    def get_queryset(self):
        qs = super().get_queryset()
        student_id = self.request.query_params.get('student')
        if student_id:
            qs = qs.filter(student_id=student_id)
        return qs


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def leaderboard_view(request):
    """
    Ranks students based on verified points and provides leaderboards for:
    - Overall
    - By Year (1st, 2nd, 3rd, 4th)
    - By Section ('A', 'B', 'C')
    - By Semester
    """
    scope = request.query_params.get('scope', 'overall')  # 'overall', 'year', 'section'
    year = request.query_params.get('year')
    section = request.query_params.get('section')
    semester = request.query_params.get('semester')

    qs = StudentProfile.objects.all().select_related('user').prefetch_related('earned_badges__badge')

    if year:
        qs = qs.filter(year_of_study=year)
    if section:
        qs = qs.filter(section=section)
    if semester:
        qs = qs.filter(semester=semester)

    # Order by total_points descending, then verified achievements count
    ranked_students = qs.order_by('-total_points', '-verified_achievements_count')[:100]

    data = []
    for idx, sp in enumerate(ranked_students, start=1):
        item = LeaderboardEntrySerializer(sp).data
        item['rank'] = idx
        data.append(item)

    return Response({
        'scope': scope,
        'filters': {'year': year, 'section': section, 'semester': semester},
        'leaderboard': data
    })
