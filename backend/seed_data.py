"""
Seed data script for ECE Connect platform.
Creates realistic academic structures, faculty profiles, students, timetables,
hackathons, badges, points ledger, classroom issues, queries, and announcements.
"""

import os
import sys
import datetime
import django

# Setup Django
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
sys.path.append(BASE_DIR)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'ece_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from django.utils import timezone
from core.models import StudentProfile, FacultyProfile, Announcement, Notification
from timetables.models import AcademicYear, ClassSection, Room, Subject, TimetableEntry, FacultyAvailability
from achievements.models import EventCategory, Achievement, TeamMember, AchievementEvidence
from gamification.models import Badge, StudentBadge, PointLedger
from issues.models import IssueReport, IssueTimeline
from feedback.models import DepartmentQuery, QueryResponse

User = get_user_model()


def seed_database():
    print("Clearing and populating ECE Connect database...")

    # 1. ACADEMIC STRUCTURE
    ay, _ = AcademicYear.objects.get_or_create(name="2026-2027", defaults={'is_current': True})

    # Class Sections
    sec_3a, _ = ClassSection.objects.get_or_create(name="ECE-III-A", defaults={'year_of_study': 3, 'semester': 6, 'section': 'A'})
    sec_3b, _ = ClassSection.objects.get_or_create(name="ECE-III-B", defaults={'year_of_study': 3, 'semester': 6, 'section': 'B'})
    sec_2a, _ = ClassSection.objects.get_or_create(name="ECE-II-A", defaults={'year_of_study': 2, 'semester': 4, 'section': 'A'})
    sec_4a, _ = ClassSection.objects.get_or_create(name="ECE-IV-A", defaults={'year_of_study': 4, 'semester': 8, 'section': 'A'})

    # Rooms
    room_201, _ = Room.objects.get_or_create(room_number="EC-201", defaults={'building': 'ECE Block', 'floor': 2, 'room_type': Room.RoomType.CLASSROOM, 'capacity': 65})
    room_202, _ = Room.objects.get_or_create(room_number="EC-202", defaults={'building': 'ECE Block', 'floor': 2, 'room_type': Room.RoomType.CLASSROOM, 'capacity': 65})
    room_dsp, _ = Room.objects.get_or_create(room_number="DSP-Lab", defaults={'building': 'ECE Block', 'floor': 3, 'room_type': Room.RoomType.LABORATORY, 'capacity': 40})
    room_vlsi, _ = Room.objects.get_or_create(room_number="VLSI-Cad-Lab", defaults={'building': 'ECE Block', 'floor': 3, 'room_type': Room.RoomType.LABORATORY, 'capacity': 40})
    room_embed, _ = Room.objects.get_or_create(room_number="Embedded-Lab", defaults={'building': 'ECE Block', 'floor': 2, 'room_type': Room.RoomType.LABORATORY, 'capacity': 35})
    room_micro, _ = Room.objects.get_or_create(room_number="Microwave-Lab", defaults={'building': 'Tech Wing', 'floor': 1, 'room_type': Room.RoomType.LABORATORY, 'capacity': 35})
    room_seminar, _ = Room.objects.get_or_create(room_number="EC-Seminar-Hall", defaults={'building': 'ECE Block', 'floor': 1, 'room_type': Room.RoomType.SEMINAR_HALL, 'capacity': 150})

    # Subjects
    sub_dsp, _ = Subject.objects.get_or_create(code="EC6401", defaults={'name': 'Digital Signal Processing', 'credits': 4, 'is_lab': False})
    sub_vlsi, _ = Subject.objects.get_or_create(code="EC6402", defaults={'name': 'VLSI Design Techniques', 'credits': 4, 'is_lab': False})
    sub_embed, _ = Subject.objects.get_or_create(code="EC6403", defaults={'name': 'Microcontroller & Embedded Systems', 'credits': 4, 'is_lab': False})
    sub_ant, _ = Subject.objects.get_or_create(code="EC6404", defaults={'name': 'Transmission Lines & Waveguides', 'credits': 3, 'is_lab': False})
    sub_dsplab, _ = Subject.objects.get_or_create(code="EC6411", defaults={'name': 'DSP & Algorithm Simulation Lab', 'credits': 2, 'is_lab': True})
    sub_vlsilab, _ = Subject.objects.get_or_create(code="EC6412", defaults={'name': 'VLSI CAD & ASIC Design Lab', 'credits': 2, 'is_lab': True})

    # 2. USERS & PROFILES
    def get_or_create_user(username, email, first_name, last_name, role, password="password123"):
        user, created = User.objects.get_or_create(
            username=username,
            defaults={'email': email, 'first_name': first_name, 'last_name': last_name, 'role': role}
        )
        if created:
            user.set_password(password)
            if role == User.Role.ADMIN:
                user.is_staff = True
                user.is_superuser = True
            user.save()
        return user

    # Admin (HOD)
    u_admin = get_or_create_user("admin", "hod.ece@college.edu", "Dr. K. Senthil", "Nathan", User.Role.ADMIN, "admin123")
    
    # President (Coordinator)
    u_pres = get_or_create_user("president", "president.ece@college.edu", "Aarav", "Sharma", User.Role.PRESIDENT, "president123")
    StudentProfile.objects.get_or_create(
        user=u_pres,
        defaults={'roll_number': '21EC001', 'year_of_study': 3, 'semester': 6, 'section': 'A', 'total_points': 450}
    )

    # Faculty members
    u_anitha = get_or_create_user("dr.anitha", "anitha.r@college.edu", "Dr. R.", "Anitha", User.Role.FACULTY, "faculty123")
    f_anitha, _ = FacultyProfile.objects.get_or_create(
        user=u_anitha,
        defaults={
            'faculty_id': 'ECFAC01',
            'designation': 'Professor & Senior VLSI Mentor',
            'cabin_number': 'EC-304',
            'office_hours': 'Mon, Wed 2:30 PM - 4:00 PM',
            'specialization': 'VLSI Architectures, Low-Power ASIC, FinFET Devices',
            'bio': '20+ years of academic and research experience in CMOS VLSI Design and FPGA synthesis.'
        }
    )

    u_raghavan = get_or_create_user("dr.raghavan", "raghavan.v@college.edu", "Dr. V.", "Raghavan", User.Role.FACULTY, "faculty123")
    f_raghavan, _ = FacultyProfile.objects.get_or_create(
        user=u_raghavan,
        defaults={
            'faculty_id': 'ECFAC02',
            'designation': 'Associate Professor',
            'cabin_number': 'EC-208',
            'office_hours': 'Tue, Thu 3:00 PM - 4:30 PM',
            'specialization': 'Embedded Systems, RTOS, IoT Edge Computing',
            'bio': 'Industry consultant and IoT Lab Director focusing on ARM Cortex and RISC-V SoC architectures.'
        }
    )

    u_meenakshi = get_or_create_user("prof.meenakshi", "meenakshi.s@college.edu", "Prof. S.", "Meenakshi", User.Role.FACULTY, "faculty123")
    f_meenakshi, _ = FacultyProfile.objects.get_or_create(
        user=u_meenakshi,
        defaults={
            'faculty_id': 'ECFAC03',
            'designation': 'Assistant Professor (Senior Grade)',
            'cabin_number': 'EC-312',
            'office_hours': 'Mon, Fri 11:30 AM - 1:00 PM',
            'specialization': 'Digital Signal Processing, Audio & Biomedical Signal Analysis',
            'bio': 'IEEE Signal Processing Society member researching adaptive filtering and deep learning for speech enhancement.'
        }
    )

    u_karthik = get_or_create_user("dr.karthik", "karthik.m@college.edu", "Dr. M.", "Karthik", User.Role.FACULTY, "faculty123")
    f_karthik, _ = FacultyProfile.objects.get_or_create(
        user=u_karthik,
        defaults={
            'faculty_id': 'ECFAC04',
            'designation': 'Assistant Professor',
            'cabin_number': 'EC-104',
            'office_hours': 'Wed, Fri 3:30 PM - 5:00 PM',
            'specialization': 'Microwave Engineering, 5G Microstrip Antennas, Radar Systems',
            'bio': 'Active researcher in millimeter-wave beamforming and RF front-end design.'
        }
    )

    # Students
    u_priya = get_or_create_user("student.priya", "priya.n@student.college.edu", "Priya", "Natarajan", User.Role.STUDENT, "student123")
    s_priya, _ = StudentProfile.objects.get_or_create(
        user=u_priya,
        defaults={'roll_number': '21EC088', 'year_of_study': 3, 'semester': 6, 'section': 'A', 'total_points': 520, 'verified_achievements_count': 4, 'hackathons_count': 3}
    )

    u_rohit = get_or_create_user("student.rohit", "rohit.k@student.college.edu", "Rohit", "Kumar", User.Role.STUDENT, "student123")
    s_rohit, _ = StudentProfile.objects.get_or_create(
        user=u_rohit,
        defaults={'roll_number': '21EC112', 'year_of_study': 3, 'semester': 6, 'section': 'B', 'total_points': 380, 'verified_achievements_count': 3, 'hackathons_count': 2}
    )

    u_sneha = get_or_create_user("student.sneha", "sneha.v@student.college.edu", "Sneha", "Venkatesh", User.Role.STUDENT, "student123")
    s_sneha, _ = StudentProfile.objects.get_or_create(
        user=u_sneha,
        defaults={'roll_number': '22EC015', 'year_of_study': 2, 'semester': 4, 'section': 'A', 'total_points': 310, 'verified_achievements_count': 2, 'hackathons_count': 2}
    )

    u_vikram = get_or_create_user("student.vikram", "vikram.s@student.college.edu", "Vikram", "Sundaram", User.Role.STUDENT, "student123")
    s_vikram, _ = StudentProfile.objects.get_or_create(
        user=u_vikram,
        defaults={'roll_number': '20EC099', 'year_of_study': 4, 'semester': 8, 'section': 'A', 'total_points': 640, 'verified_achievements_count': 5, 'hackathons_count': 4}
    )

    # 3. TIMETABLE ENTRIES (Mon-Fri)
    # Define clear realistic slots:
    # Period 1: 08:45 - 09:40
    # Period 2: 09:40 - 10:35
    # Period 3: 10:50 - 11:45
    # Period 4: 11:45 - 12:40
    # Period 5: 13:30 - 14:25
    # Period 6: 14:25 - 15:20
    # Period 7: 15:35 - 16:30

    timetable_data = [
        # Monday (day 0)
        (sec_3a, sub_dsp, f_meenakshi, room_201, 0, datetime.time(8, 45), datetime.time(9, 40), 1, False),
        (sec_3a, sub_vlsi, f_anitha, room_201, 0, datetime.time(9, 40), datetime.time(10, 35), 2, False),
        (sec_3a, sub_embed, f_raghavan, room_201, 0, datetime.time(10, 50), datetime.time(11, 45), 3, False),
        (sec_3a, sub_dsplab, f_meenakshi, room_dsp, 0, datetime.time(13, 30), datetime.time(15, 20), 5, True),

        # Tuesday (day 1)
        (sec_3a, sub_embed, f_raghavan, room_201, 1, datetime.time(8, 45), datetime.time(9, 40), 1, False),
        (sec_3a, sub_ant, f_karthik, room_201, 1, datetime.time(9, 40), datetime.time(10, 35), 2, False),
        (sec_3a, sub_dsp, f_meenakshi, room_201, 1, datetime.time(10, 50), datetime.time(11, 45), 3, False),
        (sec_3a, sub_vlsilab, f_anitha, room_vlsi, 1, datetime.time(13, 30), datetime.time(15, 20), 5, True),

        # Wednesday (day 2)
        (sec_3a, sub_vlsi, f_anitha, room_201, 2, datetime.time(8, 45), datetime.time(9, 40), 1, False),
        (sec_3a, sub_dsp, f_meenakshi, room_201, 2, datetime.time(9, 40), datetime.time(10, 35), 2, False),
        (sec_3a, sub_ant, f_karthik, room_201, 2, datetime.time(10, 50), datetime.time(11, 45), 3, False),
        (sec_3b, sub_dsp, f_meenakshi, room_202, 2, datetime.time(11, 45), datetime.time(12, 40), 4, False),

        # Thursday (day 3)
        (sec_3a, sub_ant, f_karthik, room_201, 3, datetime.time(8, 45), datetime.time(9, 40), 1, False),
        (sec_3a, sub_embed, f_raghavan, room_201, 3, datetime.time(9, 40), datetime.time(10, 35), 2, False),
        (sec_3a, sub_vlsi, f_anitha, room_201, 3, datetime.time(10, 50), datetime.time(11, 45), 3, False),
        (sec_3b, sub_vlsi, f_anitha, room_202, 3, datetime.time(11, 45), datetime.time(12, 40), 4, False),

        # Friday (day 4)
        (sec_3a, sub_dsp, f_meenakshi, room_201, 4, datetime.time(8, 45), datetime.time(9, 40), 1, False),
        (sec_3a, sub_vlsi, f_anitha, room_201, 4, datetime.time(9, 40), datetime.time(10, 35), 2, False),
        (sec_3a, sub_embed, f_raghavan, room_embed, 4, datetime.time(13, 30), datetime.time(15, 20), 5, True),
    ]

    for sec, sub, fac, rm, day, st, et, p, is_lab in timetable_data:
        TimetableEntry.objects.get_or_create(
            class_section=sec,
            subject=sub,
            faculty=fac,
            room=rm,
            day_of_week=day,
            start_time=st,
            end_time=et,
            defaults={'period_number': p, 'is_lab': is_lab}
        )

    # 4. BADGES
    badges_def = [
        ("First Step", "first-achievement", "Awarded for having your very first achievement verified by the department.", "Award", Badge.CriteriaType.ACHIEVEMENT_COUNT, 1, "teal"),
        ("Hackathon Explorer", "hackathon-explorer", "Participated in 2 or more state or national level hackathons.", "Trophy", Badge.CriteriaType.HACKATHON_COUNT, 2, "amber"),
        ("Consistent Innovator", "consistent-innovator", "Demonstrated sustained excellence with 3 verified achievements.", "Flame", Badge.CriteriaType.ACHIEVEMENT_COUNT, 3, "rose"),
        ("Semester Champion", "semester-champion", "Accumulated 250+ points in departmental technical engagement.", "Sparkles", Badge.CriteriaType.POINTS_THRESHOLD, 250, "violet"),
        ("Silicon Maestro", "silicon-maestro", "Legendary engagement: Surpassed 500 verified merit points.", "Cpu", Badge.CriteriaType.POINTS_THRESHOLD, 500, "cyan"),
        ("Community Helper", "community-helper", "Submitted 3+ validated classroom maintenance reports keeping labs operational.", "ShieldCheck", Badge.CriteriaType.COMMUNITY_HELPER, 3, "emerald"),
    ]

    for name, slug, desc, icon, ctype, cval, col in badges_def:
        b, _ = Badge.objects.get_or_create(
            slug=slug,
            defaults={'name': name, 'description': desc, 'icon_name': icon, 'criteria_type': ctype, 'criteria_value': cval, 'color': col}
        )
        # Award to Priya and Vikram
        if cval <= s_priya.total_points or (ctype == Badge.CriteriaType.ACHIEVEMENT_COUNT and s_priya.verified_achievements_count >= cval):
            StudentBadge.objects.get_or_create(student=s_priya, badge=b)
        if cval <= s_vikram.total_points or (ctype == Badge.CriteriaType.ACHIEVEMENT_COUNT and s_vikram.verified_achievements_count >= cval):
            StudentBadge.objects.get_or_create(student=s_vikram, badge=b)

    # 5. EVENT CATEGORIES
    cat_sih, _ = EventCategory.objects.get_or_create(name="Smart India Hackathon", defaults={'base_points': 100, 'description': 'National Hackathon organized by Ministry of Education'})
    cat_ieee, _ = EventCategory.objects.get_or_create(name="IEEE Conference / Symposium", defaults={'base_points': 80, 'description': 'Peer-reviewed IEEE research paper or presentation'})
    cat_vlsi, _ = EventCategory.objects.get_or_create(name="VLSI & Chip Design Contest", defaults={'base_points': 75, 'description': 'Cadence/Synopsys/OpenLane RTL and ASIC design challenges'})
    cat_robotics, _ = EventCategory.objects.get_or_create(name="Robotics & Autonomous Systems", defaults={'base_points': 70, 'description': 'Robotics competitions, autonomous rovers, and UAV challenges'})
    cat_symp, _ = EventCategory.objects.get_or_create(name="National Technical Symposium", defaults={'base_points': 50, 'description': 'Inter-collegiate technical contests, circuit debugging, paper presentations'})

    # 6. ACHIEVEMENTS & POINT LEDGER
    ach_1, _ = Achievement.objects.get_or_create(
        student=s_priya,
        title="SIH 2026 Winner - Smart Irrigation with TinyML Edge Node",
        defaults={
            'event_name': 'Smart India Hackathon 2026 (Grand Finale)',
            'category': cat_sih,
            'organizer': 'Ministry of Education & AICTE',
            'event_date': datetime.date(2026, 8, 22),
            'is_team': True,
            'team_name': 'AgriSense ECE',
            'achievement_level': Achievement.Level.WINNER,
            'points_awarded': 350,
            'description': 'Engineered an ultra-low power ESP32-S3 TinyML edge device with LoRaWAN telemetry to predict crop moisture stress. Deployed on real farm plots with 94.2% accuracy.',
            'skills_used': 'TinyML, TensorFlow Lite for Microcontrollers, KiCad PCB, LoRaWAN, C++',
            'event_website': 'https://www.sih.gov.in',
            'status': Achievement.Status.APPROVED,
            'reviewed_by': u_admin,
            'reviewed_at': timezone.now() - datetime.timedelta(days=20),
            'reviewer_feedback': 'Outstanding interdisciplinary work bringing national prestige to the ECE Department!'
        }
    )
    PointLedger.objects.get_or_create(
        idempotency_key=f"ACH-{ach_1.id}-APPROVAL",
        defaults={
            'student': s_priya,
            'points': 350,
            'reason': 'Verified: SIH 2026 Winner (Winner - 1st Place)',
            'rule_code': PointLedger.RuleCode.ACHIEVEMENT_VERIFIED,
            'achievement': ach_1,
            'awarded_by': u_admin,
        }
    )

    ach_2, _ = Achievement.objects.get_or_create(
        student=s_priya,
        title="IEEE International Paper: Low-Power Radix-4 Butterfly FFT for 5G",
        defaults={
            'event_name': 'IEEE International Conference on Advanced Communications (ICAC 2026)',
            'category': cat_ieee,
            'organizer': 'IEEE Communications Society',
            'event_date': datetime.date(2026, 9, 14),
            'is_team': False,
            'achievement_level': Achievement.Level.FIRST_PLACE,
            'points_awarded': 170,
            'description': 'Synthesized a pipelined Radix-4 64-point FFT processor utilizing clock gating and Booth multiplication in 45nm CMOS technology.',
            'skills_used': 'Verilog HDL, Cadence Genus, ModelSim, MATLAB',
            'status': Achievement.Status.APPROVED,
            'reviewed_by': u_anitha,
            'reviewed_at': timezone.now() - datetime.timedelta(days=10),
            'reviewer_feedback': 'Rigorous simulation and timing closure results.'
        }
    )

    ach_3, _ = Achievement.objects.get_or_create(
        student=s_rohit,
        title="Cadence ASIC Design Contest - Finalist",
        defaults={
            'event_name': 'National VLSI Design Olympiad 2026',
            'category': cat_vlsi,
            'organizer': 'Cadence Design Systems',
            'event_date': datetime.date(2026, 9, 28),
            'is_team': True,
            'team_name': 'SiliconPulse',
            'achievement_level': Achievement.Level.FINALIST,
            'points_awarded': 150,
            'description': 'Designed and placed a RISC-V RV32I 5-stage core with hazard mitigation logic achieving 120 MHz fmax on 65nm cell library.',
            'skills_used': 'RISC-V, SystemVerilog, Cadence Innovus, DRC/LVS Clean',
            'status': Achievement.Status.APPROVED,
            'reviewed_by': u_admin,
            'reviewed_at': timezone.now() - datetime.timedelta(days=5),
            'reviewer_feedback': 'Verified layout and simulation log.'
        }
    )

    ach_pending, _ = Achievement.objects.get_or_create(
        student=s_sneha,
        title="Autonomous Quadcopter Fire Detection in Warehouse",
        defaults={
            'event_name': 'IIT Techfest Robotics Challenge 2026',
            'category': cat_robotics,
            'organizer': 'IIT Bombay',
            'event_date': datetime.date(2026, 10, 2),
            'is_team': True,
            'team_name': 'AeroECE',
            'achievement_level': Achievement.Level.SHORTLISTED,
            'points_awarded': 0,
            'description': 'Equipped an F450 drone with Raspberry Pi 4 and FLIR thermal sensor running YOLOv8-nano at 22 fps.',
            'skills_used': 'ROS2, OpenCV, PyTorch, Flight Controller Betaflight',
            'status': Achievement.Status.PENDING,
        }
    )

    # 7. CLASSROOM ISSUES
    iss_1, _ = IssueReport.objects.get_or_create(
        reference_id="ECE-ISS-2026-0001",
        defaults={
            'reported_by': u_priya,
            'category': IssueReport.Category.PROJECTOR_DISPLAY,
            'building': 'ECE Block',
            'floor': 2,
            'room': room_201,
            'item_equipment': 'Epson EB-X06 Overhead Projector',
            'title': 'Projector flickering and HDMI port loose in EC-201',
            'description': 'During VLSI lecture, the ceiling projector display blinks green every 2 minutes. The wall HDMI plate appears loose.',
            'priority': IssueReport.Priority.HIGH,
            'status': IssueReport.Status.IN_PROGRESS,
            'assigned_to': u_admin,
        }
    )
    IssueTimeline.objects.get_or_create(
        issue=iss_1,
        action="STATUS_UPDATED",
        new_status=IssueReport.Status.IN_PROGRESS,
        defaults={'actor': u_admin, 'note': 'AV Technician assigned with replacement HDMI patch cable.'}
    )

    iss_2, _ = IssueReport.objects.get_or_create(
        reference_id="ECE-ISS-2026-0002",
        defaults={
            'reported_by': u_rohit,
            'category': IssueReport.Category.FAN_VENTILATION,
            'building': 'ECE Block',
            'floor': 3,
            'room': room_dsp,
            'item_equipment': 'Ceiling Fan #3 (East Row)',
            'title': 'Ceiling Fan #3 vibrating with loud grinding noise',
            'description': 'The fan above Workbench 6 in DSP Lab is vibrating violently and emitting screeching bearing noise.',
            'priority': IssueReport.Priority.URGENT,
            'status': IssueReport.Status.SUBMITTED,
        }
    )

    iss_3, _ = IssueReport.objects.get_or_create(
        reference_id="ECE-ISS-2026-0003",
        defaults={
            'reported_by': u_sneha,
            'category': IssueReport.Category.MARKER_WHITEBOARD,
            'building': 'ECE Block',
            'floor': 2,
            'room': room_202,
            'item_equipment': 'Whiteboard Marker Stand',
            'title': 'Markers dried out and duster missing in EC-202',
            'description': 'All markers in room EC-202 are dry. Faculty had to borrow marker from staff room.',
            'priority': IssueReport.Priority.LOW,
            'status': IssueReport.Status.RESOLVED,
            'resolution_notes': 'Refilled pack of 4 Camlin whiteboard markers and placed new magnetic duster.',
            'resolved_at': timezone.now() - datetime.timedelta(days=2)
        }
    )

    # 8. DEPARTMENT QUERIES
    qry_1, _ = DepartmentQuery.objects.get_or_create(
        reference_id="ECE-QRY-2026-0001",
        defaults={
            'student': u_priya,
            'is_anonymous': False,
            'category': DepartmentQuery.Category.HACKATHON_EVENT,
            'subject': 'Lab access after 6:00 PM for Cadence VLSI Contest preparation',
            'description': 'Our team SiliconPulse has qualified for the final round. Could the department permit lab access in VLSI-Cad-Lab till 8:30 PM for 3 days next week under faculty supervision?',
            'target_faculty': f_anitha,
            'status': DepartmentQuery.Status.RESPONSE_PROVIDED,
        }
    )
    QueryResponse.objects.get_or_create(
        query=qry_1,
        responder=u_anitha,
        response_text="Approved. Lab assistant Mr. Murugan will be on duty till 8:30 PM. Please maintain safety protocols and sign the late logbook.",
        is_internal_note=False
    )

    qry_2, _ = DepartmentQuery.objects.get_or_create(
        reference_id="ECE-QRY-2026-0002",
        defaults={
            'student': u_rohit,
            'is_anonymous': True,
            'category': DepartmentQuery.Category.TIMETABLE,
            'subject': 'Class clash suggestion for Elective 2: TinyML vs Optical Networks',
            'description': 'Could the Tuesday 11:45 slot be shifted to Wednesday afternoon to avoid clash with open elective?',
            'status': DepartmentQuery.Status.UNDER_REVIEW,
        }
    )

    # 9. ANNOUNCEMENTS
    Announcement.objects.get_or_create(
        title="Smart India Hackathon 2026: Departmental Internal Screening",
        defaults={
            'content': 'All student teams wishing to submit proposals for SIH 2026 hardware and software editions must submit executive summaries by Oct 18 in ECE Connect. Faculty mentors will conduct reviews in EC-Seminar-Hall.',
            'author': u_admin,
            'priority': Announcement.Priority.URGENT,
            'target_role': Announcement.TargetRole.ALL,
            'is_pinned': True,
        }
    )
    Announcement.objects.get_or_create(
        title="Cadence EDA Tools Cloud Server Upgrade",
        defaults={
            'content': 'The department VLSI server will undergo scheduled kernel updates this Saturday from 8:00 AM to 1:00 PM. Remote SSH sessions will be unavailable during this window.',
            'author': u_anitha,
            'priority': Announcement.Priority.IMPORTANT,
            'target_role': Announcement.TargetRole.ALL,
            'is_pinned': False,
        }
    )

    print("Seed data loaded successfully!")


if __name__ == '__main__':
    seed_database()
