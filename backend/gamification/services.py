from django.db import transaction
from django.utils import timezone
from .models import Badge, StudentBadge, PointLedger
from core.models import StudentProfile, Notification


def award_points_to_student(student_profile, points, reason, rule_code, achievement=None, actor=None, idempotency_key=None):
    """
    Idempotent transactional points award logic maintaining full audit ledger.
    """
    if not idempotency_key:
        idempotency_key = f"PTS-{student_profile.id}-{timezone.now().timestamp()}"

    # Check if this award was already processed
    existing = PointLedger.objects.filter(idempotency_key=idempotency_key).first()
    if existing:
        return existing

    with transaction.atomic():
        ledger_entry = PointLedger.objects.create(
            student=student_profile,
            points=points,
            reason=reason,
            rule_code=rule_code,
            achievement=achievement,
            awarded_by=actor,
            idempotency_key=idempotency_key,
        )

        # Update denormalized total
        student_profile.total_points = max(0, student_profile.total_points + points)
        if achievement and points > 0:
            student_profile.verified_achievements_count += 1
            if 'hackathon' in achievement.event_name.lower() or 'hack' in achievement.title.lower():
                student_profile.hackathons_count += 1
        student_profile.save()

        # Check badges eligibility
        check_and_award_badges(student_profile)

        # Notify student
        sign = "+" if points > 0 else ""
        Notification.objects.create(
            recipient=student_profile.user,
            title="Points Awarded!",
            message=f"You earned {sign}{points} points for: {reason}.",
            notification_type=Notification.NotificationType.ACHIEVEMENT,
            link=f"/achievements/{achievement.id}" if achievement else "/leaderboard"
        )

    return ledger_entry


def check_and_award_badges(student_profile):
    """
    Checks all badge criteria and awards new badges to the student.
    """
    badges = Badge.objects.all()
    for badge in badges:
        # Check if already earned
        if StudentBadge.objects.filter(student=student_profile, badge=badge).exists():
            continue

        eligible = False
        if badge.criteria_type == Badge.CriteriaType.POINTS_THRESHOLD:
            if student_profile.total_points >= badge.criteria_value:
                eligible = True
        elif badge.criteria_type == Badge.CriteriaType.ACHIEVEMENT_COUNT:
            if student_profile.verified_achievements_count >= badge.criteria_value:
                eligible = True
        elif badge.criteria_type == Badge.CriteriaType.HACKATHON_COUNT:
            if student_profile.hackathons_count >= badge.criteria_value:
                eligible = True
        elif badge.criteria_type == Badge.CriteriaType.COMMUNITY_HELPER:
            if student_profile.classroom_issues_count >= badge.criteria_value:
                eligible = True

        if eligible:
            StudentBadge.objects.create(
                student=student_profile,
                badge=badge,
                note=f"Unlocked by reaching {badge.criteria_value} {badge.get_criteria_type_display()}"
            )
            Notification.objects.create(
                recipient=student_profile.user,
                title="New Badge Unlocked!",
                message=f"Congratulations! You unlocked the '{badge.name}' badge! {badge.description}",
                notification_type=Notification.NotificationType.BADGE,
                link="/leaderboard"
            )
