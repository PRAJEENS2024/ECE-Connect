export type Role = 'STUDENT' | 'FACULTY' | 'PRESIDENT' | 'ADMIN';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: Role;
  phone: string;
  is_active: boolean;
  created_at: string;
}

export interface StudentProfile {
  id: number;
  user: User;
  roll_number: string;
  department: string;
  year_of_study: number;
  semester: number;
  section: string;
  total_points: number;
  verified_achievements_count: number;
  hackathons_count: number;
  classroom_issues_count: number;
}

export interface FacultyProfile {
  id: number;
  user_name: string;
  email: string;
  faculty_id: string;
  department: string;
  designation: string;
  cabin_number: string;
  office_hours: string;
  bio: string;
  specialization: string;
  phone: string;
  current_status: string;
  status_note: string;
  expected_location: ExpectedLocation;
  subjects_taught?: string[];
}

export interface ExpectedLocation {
  status: string;
  status_label: string;
  expected_location: string;
  subject?: string;
  class_section?: string;
  time_slot?: string;
  detail?: string;
  next_activity?: string;
  is_timetable_derived?: boolean;
  is_conflict?: boolean;
  disclaimer?: string;
}

export interface Room {
  id: number;
  room_number: string;
  building: string;
  floor: number;
  room_type: string;
  capacity: number;
}

export interface Subject {
  id: number;
  code: string;
  name: string;
  credits: number;
  is_lab: boolean;
}

export interface ClassSection {
  id: number;
  name: string;
  year_of_study: number;
  semester: number;
  section: string;
}

export interface TimetableEntry {
  id: number;
  class_section: number;
  class_section_name: string;
  subject: number;
  subject_code: string;
  subject_name: string;
  faculty: number;
  faculty_name: string;
  faculty_cabin: string;
  room: number;
  room_number: string;
  room_building: string;
  room_floor: number;
  day_of_week: number;
  day_name: string;
  start_time: string;
  end_time: string;
  period_number: number;
  is_lab: boolean;
}

export interface EventCategory {
  id: number;
  name: string;
  description: string;
  base_points: number;
  is_active: boolean;
}

export interface TeamMember {
  id: number;
  achievement: number;
  student: number | null;
  student_name: string;
  roll_number?: string;
  external_name: string;
  role_description: string;
  points_awarded: number;
}

export interface AchievementEvidence {
  id: number;
  achievement: number;
  evidence_type: string;
  file: string | null;
  external_url: string;
  caption: string;
  uploaded_at: string;
}

export interface Achievement {
  id: number;
  student: number;
  student_name: string;
  roll_number: string;
  year_of_study: number;
  title: string;
  event_name: string;
  category: number;
  category_name: string;
  organizer: string;
  event_date: string;
  is_team: boolean;
  team_name: string;
  achievement_level: string;
  level_label: string;
  points_awarded: number;
  description: string;
  skills_used: string;
  event_website: string;
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'CHANGES_REQUESTED';
  status_label: string;
  reviewed_by: number | null;
  reviewed_by_name: string;
  reviewed_at: string | null;
  reviewer_feedback: string;
  student_confirmed: boolean;
  created_at: string;
  updated_at: string;
  team_members: TeamMember[];
  evidence: AchievementEvidence[];
}

export interface Badge {
  id: number;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  criteria_type: string;
  criteria_value: number;
  color: string;
}

export interface StudentBadge {
  id: number;
  student: number;
  badge: number;
  badge_name: string;
  badge_description: string;
  badge_icon: string;
  badge_color: string;
  awarded_at: string;
  note: string;
}

export interface PointLedgerEntry {
  id: number;
  student: number;
  student_name: string;
  roll_number: string;
  points: number;
  reason: string;
  rule_code: string;
  achievement: number | null;
  awarded_by_name: string;
  idempotency_key: string;
  created_at: string;
}

export interface LeaderboardEntry {
  id: number;
  student_name: string;
  username: string;
  roll_number: string;
  year_of_study: number;
  semester: number;
  section: string;
  total_points: number;
  verified_achievements_count: number;
  hackathons_count: number;
  earned_badges: StudentBadge[];
  rank: number;
}

export interface IssueTimelineEntry {
  id: number;
  issue: number;
  actor: number | null;
  actor_name: string;
  action: string;
  old_status: string;
  new_status: string;
  note: string;
  is_internal: boolean;
  created_at: string;
}

export interface IssueReport {
  id: number;
  reference_id: string;
  reported_by: number;
  reported_by_name: string;
  category: string;
  category_label: string;
  building: string;
  floor: number;
  room: number | null;
  room_number_text: string;
  room_details?: Room;
  item_equipment: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  priority_label: string;
  status: string;
  status_label: string;
  assigned_to: number | null;
  assigned_to_name: string;
  resolution_notes: string;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
  timeline: IssueTimelineEntry[];
  attachments: { id: number; file: string; caption: string }[];
}

export interface QueryResponse {
  id: number;
  query: number;
  responder: number;
  responder_name: string;
  responder_role: string;
  response_text: string;
  is_internal_note: boolean;
  created_at: string;
}

export interface DepartmentQuery {
  id: number;
  reference_id: string;
  student: number | null;
  student_name: string;
  is_anonymous: boolean;
  category: string;
  category_label: string;
  subject: string;
  description: string;
  target_faculty: number | null;
  target_faculty_name: string;
  status: string;
  status_label: string;
  assigned_to: number | null;
  created_at: string;
  updated_at: string;
  responses: QueryResponse[];
}

export interface Announcement {
  id: number;
  title: string;
  content: string;
  author: number;
  author_name: string;
  priority: 'NORMAL' | 'IMPORTANT' | 'URGENT';
  target_role: string;
  is_pinned: boolean;
  created_at: string;
}

export interface NotificationItem {
  id: number;
  recipient: number;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  notification_type: string;
  created_at: string;
}

export interface DashboardKPIs {
  kpis: {
    total_students: number;
    total_faculty: number;
    verified_achievements: number;
    pending_achievements: number;
    hackathon_submissions: number;
    total_issues: number;
    open_issues: number;
    high_priority_issues: number;
    resolved_issues: number;
    pending_queries: number;
    total_department_points: number;
    resolution_rate: number;
  };
  achievement_categories: { category__name: string; total: number; approved: number }[];
  issue_categories: { name: string; total: number; open: number }[];
  year_distribution: { year_of_study: number; students: number; total_points: number; verified: number }[];
  monthly_trend: { month: string; submissions: number; verified: number; issues: number }[];
}
