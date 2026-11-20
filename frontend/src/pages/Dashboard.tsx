import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Trophy,
  Award,
  AlertTriangle,
  Calendar,
  Sparkles,
  Users,
  Clock,
  ArrowRight,
  CheckCircle2,
  Megaphone,
  PlusCircle,
  MapPin,
  ExternalLink,
  Zap,
  Briefcase,
  GraduationCap
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Achievement, IssueReport, Announcement, TimetableEntry } from '../types';

interface DashboardProps {
  onOpenQuickAction: () => void;
  onSelectAction: (key: 'achievement' | 'issue' | 'query') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenQuickAction, onSelectAction }) => {
  const { user, profile, isStudent, isFaculty, isHOD, isAdmin, roleLabel } = useAuth();
  const navigate = useNavigate();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [todaySchedule, setTodaySchedule] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        // Get today's day of week (0=Mon .. 6=Sun)
        const dayOfWeek = new Date().getDay();
        const djangoDay = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // convert Sun to 6, Mon to 0

        const [achData, issData, annData, ttData] = await Promise.all([
          api.achievements.list('limit=5'),
          api.issues.list('my_issues=true&limit=4'),
          api.announcements.list(),
          api.timetables.getEntries(`day=${djangoDay <= 5 ? djangoDay : 0}`),
        ]);

        setAchievements(achData);
        setIssues(issData);
        setAnnouncements(annData);
        setTodaySchedule(ttData.slice(0, 5));
      } catch (err) {
        console.error('Error loading dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  const points = (profile as any)?.total_points || 0;
  const verifiedCount = (profile as any)?.verified_achievements_count || 0;
  const hackathons = (profile as any)?.hackathons_count || 0;

  return (
    <div className="space-y-6">
      {/* 1. HERO WELCOME BANNER (Clean White & Blue Gradient Accent) */}
      <div className="relative rounded-2xl overflow-hidden bg-white border border-slate-200 p-7 shadow-clean">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-blue-50/70 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Department of Electronics & Communication Engineering
              </span>
              <span className="text-xs text-slate-400 font-medium">AY 2026-2027</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Welcome back, <span className="text-blue-600">{user?.full_name || user?.username}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl leading-relaxed">
              {isHOD
                ? 'Department leadership console active. Monitor verification queues, oversee room tickets, and coordinate academic schedules.'
                : isFaculty
                ? 'Faculty portal active. Check today’s lab allocations, manage student queries, and review research submissions.'
                : 'Track your verified hackathon wins, inspect dynamic faculty schedules, log classroom maintenance, and participate in departmental gamification.'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => onSelectAction('achievement')}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 hover:shadow-lg flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Submit Achievement</span>
            </button>
            <button
              onClick={() => onSelectAction('issue')}
              className="px-4 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs transition-all flex items-center gap-2 shadow-sm"
            >
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. KPI METRICS CARDS (Clean White & High Contrast) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md hover:border-amber-300 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Merit Points</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200/60">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900 flex items-baseline gap-1.5">
            <span>{points}</span>
            <span className="text-xs text-amber-600 font-bold">PTS</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Verified hackathons & awards</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md hover:border-blue-300 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Verified Awards</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200/60">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{verifiedCount}</div>
          <p className="text-[11px] text-slate-400 mt-1">Certified submissions</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md hover:border-purple-300 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Hackathons Entered</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-200/60">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{hackathons}</div>
          <p className="text-[11px] text-slate-400 mt-1">National & collegiate events</p>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md hover:border-emerald-300 transition-all group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500">Classroom Reports</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200/60">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-extrabold text-slate-900">{(profile as any)?.classroom_issues_count || 0}</div>
          <p className="text-[11px] text-slate-400 mt-1">Maintenance logs filed</p>
        </div>
      </div>

      {/* 3. MAIN 2-COLUMN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Schedule + Active Issues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Academic Schedule */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-clean">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Today's Class Schedule & Expected Faculty Location
                  </h2>
                  <p className="text-[11px] text-slate-400">Derived in real-time from official departmental timetable</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/timetable')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                No classes scheduled for today. Great time for lab project work!
              </div>
            ) : (
              <div className="space-y-3">
                {todaySchedule.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 text-center py-1.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                        <span className="text-[11px] font-mono font-bold text-blue-600 block leading-tight">
                          {entry.start_time.slice(0, 5)}
                        </span>
                        <span className="text-[9px] text-slate-400 block leading-tight">
                          {entry.end_time.slice(0, 5)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">{entry.subject_name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                            {entry.subject_code}
                          </span>
                          {entry.is_lab && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                              LAB
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1 text-slate-700 font-medium">
                            <MapPin className="w-3 h-3 text-blue-600" />
                            {entry.room_number} ({entry.room_building})
                          </span>
                          <span>•</span>
                          <span>Faculty: <strong className="text-slate-800">{entry.faculty_name}</strong></span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/faculty')}
                      className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-600 text-slate-700 hover:text-white border border-slate-200 hover:border-transparent text-xs font-semibold transition-all shadow-2xs shrink-0"
                    >
                      Locate Cabin
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Classroom Issues Tracked */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-clean">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                    Recent Classroom Maintenance Reports
                  </h2>
                  <p className="text-[11px] text-slate-400">Tracked issues with real-time status resolution</p>
                </div>
              </div>
              <button
                onClick={() => navigate('/issues')}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1"
              >
                <span>All Issues</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {issues.length === 0 ? (
              <div className="py-10 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                No active classroom issues logged right now.
              </div>
            ) : (
              <div className="space-y-3">
                {issues.map((iss) => (
                  <div
                    key={iss.id}
                    onClick={() => navigate('/issues')}
                    className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 hover:border-slate-300 hover:bg-white transition-all cursor-pointer flex items-center justify-between gap-4 shadow-2xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white text-slate-700 font-bold border border-slate-200">
                          {iss.reference_id}
                        </span>
                        <span className="text-xs font-bold text-slate-900">{iss.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Location: <span className="font-semibold text-slate-700">{iss.room_details?.room_number || iss.building}</span> | Equipment: {iss.item_equipment}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase border ${
                          iss.status === 'RESOLVED'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : iss.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-blue-50 text-blue-700 border-blue-200'
                        }`}
                      >
                        {iss.status_label}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column (1 Col): Department Bulletins + Quick Links */}
        <div className="space-y-6">
          {/* Department Bulletins */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-clean">
            <div className="flex items-center gap-2.5 mb-5">
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                <Megaphone className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Official Department Bulletins
                </h2>
                <p className="text-[11px] text-slate-400">Notices from HOD & Department Office</p>
              </div>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  className={`p-4 rounded-xl border text-xs transition-all ${
                    ann.priority === 'URGENT'
                      ? 'bg-rose-50/60 border-rose-200 text-slate-800'
                      : 'bg-slate-50/70 border-slate-200 text-slate-700 hover:bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-bold text-slate-900 text-xs">{ann.title}</span>
                    {ann.is_pinned && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800">
                        PINNED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">{ann.content}</p>
                  <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-200/60 text-[10px] text-slate-400">
                    <span>By <strong className="text-slate-600">{ann.author_name}</strong></span>
                    <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-2xl bg-white border border-slate-200 p-6 shadow-clean">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3.5">
              Quick Portals
            </h3>
            <div className="space-y-2.5">
              <button
                onClick={() => navigate('/faculty')}
                className="w-full text-left p-3 rounded-xl bg-slate-50/70 hover:bg-blue-50/40 border border-slate-200 hover:border-blue-200 flex items-center justify-between text-xs text-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span className="font-semibold">Check Faculty Cabin & Office Hours</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => navigate('/leaderboard')}
                className="w-full text-left p-3 rounded-xl bg-slate-50/70 hover:bg-amber-50/40 border border-slate-200 hover:border-amber-200 flex items-center justify-between text-xs text-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Award className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold">View Department Merit Leaderboard</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => onSelectAction('query')}
                className="w-full text-left p-3 rounded-xl bg-slate-50/70 hover:bg-emerald-50/40 border border-slate-200 hover:border-emerald-200 flex items-center justify-between text-xs text-slate-800 transition-all group"
              >
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold">Submit Student Query or Feedback</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
