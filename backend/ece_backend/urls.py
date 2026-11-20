from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter

from core.views import (
    auth_login, auth_register, auth_logout, current_user, list_demo_users,
    AnnouncementViewSet, NotificationViewSet, AuditLogViewSet
)
from timetables.views import (
    ClassSectionViewSet, RoomViewSet, SubjectViewSet, TimetableEntryViewSet,
    FacultyDirectoryViewSet, FacultyAvailabilityViewSet, ScheduleExceptionViewSet,
    class_timetable_matrix, validate_timetable_conflict
)
from achievements.views import EventCategoryViewSet, AchievementViewSet
from gamification.views import BadgeViewSet, PointLedgerViewSet, leaderboard_view
from issues.views import IssueReportViewSet
from feedback.views import DepartmentQueryViewSet
from analytics.views import department_dashboard_kpis, etl_pipeline_history, trigger_etl_run

router = DefaultRouter()
router.register(r'announcements', AnnouncementViewSet, basename='announcement')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'audit-logs', AuditLogViewSet, basename='auditlog')
router.register(r'classes', ClassSectionViewSet, basename='classsection')
router.register(r'rooms', RoomViewSet, basename='room')
router.register(r'subjects', SubjectViewSet, basename='subject')
router.register(r'timetables', TimetableEntryViewSet, basename='timetable')
router.register(r'faculty', FacultyDirectoryViewSet, basename='faculty')
router.register(r'faculty-availability', FacultyAvailabilityViewSet, basename='faculty-availability')
router.register(r'schedule-exceptions', ScheduleExceptionViewSet, basename='schedule-exception')
router.register(r'categories', EventCategoryViewSet, basename='eventcategory')
router.register(r'achievements', AchievementViewSet, basename='achievement')
router.register(r'badges', BadgeViewSet, basename='badge')
router.register(r'points-ledger', PointLedgerViewSet, basename='pointledger')
router.register(r'issues', IssueReportViewSet, basename='issue')
router.register(r'queries', DepartmentQueryViewSet, basename='query')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # Authentication endpoints
    path('api/auth/login/', auth_login, name='api-login'),
    path('api/auth/register/', auth_register, name='api-register'),
    path('api/auth/logout/', auth_logout, name='api-logout'),
    path('api/auth/me/', current_user, name='api-me'),
    path('api/auth/demo-users/', list_demo_users, name='api-demo-users'),

    # Timetable matrix and conflict validation
    path('api/timetables/class-matrix/<int:section_id>/', class_timetable_matrix, name='class-timetable-matrix'),
    path('api/timetables/validate-conflict/', validate_timetable_conflict, name='validate-timetable-conflict'),

    # Gamification
    path('api/leaderboard/', leaderboard_view, name='api-leaderboard'),

    # Analytics & Data Pipeline
    path('api/analytics/kpis/', department_dashboard_kpis, name='analytics-kpis'),
    path('api/analytics/etl-history/', etl_pipeline_history, name='analytics-etl-history'),
    path('api/analytics/trigger-etl/', trigger_etl_run, name='analytics-trigger-etl'),

    # Router generated CRUD endpoints
    path('api/', include(router.urls)),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
