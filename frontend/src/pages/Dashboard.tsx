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
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Achievement, IssueReport, Announcement, TimetableEntry } from '../types';

interface DashboardProps {
  onOpenQuickAction: () => void;
  onSelectAction: (key: 'achievement' | 'issue' | 'query') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onOpenQuickAction, onSelectAction }) => {
  const { user, profile, isStudent } = useAuth();
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
      {/* Hero Welcome Banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-r from-surface-elevated via-surface to-surface border border-surface-border p-6 shadow-surface-card">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-cyan-500/10 to-transparent pointer-events-none" />
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                Department of Electronics & Communication Engineering
              </span>
              <span className="text-xs text-gray-400">Academic Year 2026-2027</span>
            </div>
            <h1 className="text-2xl font-black text-white tracking-tight">
              Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-teal-300">{user?.full_name}</span>!
            </h1>
            <p className="text-xs text-gray-400 mt-1 max-w-xl">
              Track your hackathon milestones, view live faculty schedules, report classroom maintenance, and participate in departmental gamification.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => onSelectAction('achievement')}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-sm hover:shadow-glow-teal flex items-center gap-2"
            >
              <Trophy className="w-4 h-4" />
              <span>Submit Achievement</span>
            </button>
            <button
              onClick={() => onSelectAction('issue')}
              className="px-4 py-2 rounded-xl bg-surface-elevated hover:bg-surface-hover text-gray-200 border border-surface-border font-semibold text-xs transition flex items-center gap-2"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Report Issue</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-surface border border-surface-border relative overflow-hidden group hover:border-amber-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Verified Merit Points</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white flex items-baseline gap-1">
            <span>{points}</span>
            <span className="text-xs text-amber-400 font-bold">PTS</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-1">From verified hackathons & contests</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border relative overflow-hidden group hover:border-cyan-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Verified Achievements</span>
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 text-cyan-400 flex items-center justify-center">
              <Trophy className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{verifiedCount}</div>
          <p className="text-[11px] text-gray-500 mt-1">Official certificate submissions</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border relative overflow-hidden group hover:border-violet-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Hackathons Entered</span>
            <div className="w-8 h-8 rounded-lg bg-violet-500/15 text-violet-400 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{hackathons}</div>
          <p className="text-[11px] text-gray-500 mt-1">National & collegiate events</p>
        </div>

        <div className="p-4 rounded-xl bg-surface border border-surface-border relative overflow-hidden group hover:border-emerald-500/40 transition">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-400">Classroom Reports</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{(profile as any)?.classroom_issues_count || 0}</div>
          <p className="text-[11px] text-gray-500 mt-1">Community maintenance logs</p>
        </div>
      </div>

      {/* Main 2-Column Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column (2 Cols): Today's Schedule + Active Issues */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Academic Schedule */}
          <div className="rounded-xl bg-surface border border-surface-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-brand-cyan" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Today's Class Schedule & Faculty Locator
                </h2>
              </div>
              <button
                onClick={() => navigate('/timetable')}
                className="text-xs font-medium text-brand-cyan hover:underline flex items-center gap-1"
              >
                <span>Full Timetable</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {todaySchedule.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 bg-surface-elevated/40 rounded-xl border border-dashed border-surface-border">
                No classes scheduled for today. Enjoy your project time!
              </div>
            ) : (
              <div className="space-y-2.5">
                {todaySchedule.map((entry) => (
                  <div
                    key={entry.id}
                    className="p-3 rounded-lg bg-surface-elevated/70 border border-surface-border hover:border-cyan-500/30 transition flex items-center justify-between gap-3 group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-14 text-center py-1 rounded bg-surface border border-surface-border">
                        <span className="text-[10px] font-mono font-bold text-cyan-400 block leading-tight">
                          {entry.start_time.slice(0, 5)}
                        </span>
                        <span className="text-[9px] text-gray-500 block leading-tight">
                          {entry.end_time.slice(0, 5)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-white">{entry.subject_name}</span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface text-gray-400">
                            {entry.subject_code}
                          </span>
                          {entry.is_lab && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                              LAB
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-[11px] text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-cyan-400" />
                            {entry.room_number} ({entry.room_building})
                          </span>
                          <span>•</span>
                          <span>Faculty: {entry.faculty_name}</span>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => navigate('/faculty')}
                      className="px-2.5 py-1 rounded bg-surface hover:bg-cyan-500/20 text-gray-300 hover:text-cyan-300 border border-surface-border text-[11px] font-medium transition shrink-0"
                    >
                      Locate Cabin
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Active Classroom Issues Tracked */}
          <div className="rounded-xl bg-surface border border-surface-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Classroom Issues Reported by You
                </h2>
              </div>
              <button
                onClick={() => navigate('/issues')}
                className="text-xs font-medium text-brand-cyan hover:underline flex items-center gap-1"
              >
                <span>View All Issues</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {issues.length === 0 ? (
              <div className="py-8 text-center text-xs text-gray-500 bg-surface-elevated/40 rounded-xl border border-dashed border-surface-border">
                You haven't reported any open classroom problems yet.
              </div>
            ) : (
              <div className="space-y-2.5">
                {issues.map((iss) => (
                  <div
                    key={iss.id}
                    onClick={() => navigate('/issues')}
                    className="p-3.5 rounded-lg bg-surface-elevated/70 border border-surface-border hover:border-rose-500/30 transition cursor-pointer flex items-center justify-between gap-4"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-surface text-gray-400 font-bold">
                          {iss.reference_id}
                        </span>
                        <span className="text-xs font-bold text-white">{iss.title}</span>
                      </div>
                      <p className="text-[11px] text-gray-400 mt-1">
                        Location: {iss.room_details?.room_number || iss.building} | Item: {iss.item_equipment}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          iss.status === 'RESOLVED'
                            ? 'bg-emerald-500/20 text-emerald-300'
                            : iss.status === 'IN_PROGRESS'
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-cyan-500/20 text-cyan-300'
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

        {/* Right Column (1 Col): Department Announcements + Quick Links */}
        <div className="space-y-6">
          {/* Department Announcements */}
          <div className="rounded-xl bg-surface border border-surface-border p-5">
            <div className="flex items-center gap-2 mb-4">
              <Megaphone className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Department Bulletins
              </h2>
            </div>

            <div className="space-y-3">
              {announcements.slice(0, 3).map((ann) => (
                <div
                  key={ann.id}
                  className={`p-3.5 rounded-lg border text-xs transition ${
                    ann.priority === 'URGENT'
                      ? 'bg-rose-500/10 border-rose-500/30 text-gray-200'
                      : 'bg-surface-elevated/70 border-surface-border text-gray-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-white text-xs">{ann.title}</span>
                    {ann.is_pinned && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300">
                        PINNED
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 mt-1 leading-relaxed">{ann.content}</p>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5 text-[10px] text-gray-500">
                    <span>By {ann.author_name}</span>
                    <span>{new Date(ann.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Shortcuts */}
          <div className="rounded-xl bg-surface border border-surface-border p-5">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
              Department Operations
            </h3>
            <div className="space-y-2">
              <button
                onClick={() => navigate('/faculty')}
                className="w-full text-left p-2.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border flex items-center justify-between text-xs text-white transition"
              >
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  <span>Check Faculty Cabin & Schedule</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </button>

              <button
                onClick={() => navigate('/leaderboard')}
                className="w-full text-left p-2.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border flex items-center justify-between text-xs text-white transition"
              >
                <div className="flex items-center gap-2.5">
                  <Award className="w-4 h-4 text-amber-400" />
                  <span>View Department Merit Leaderboard</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </button>

              <button
                onClick={() => onSelectAction('query')}
                className="w-full text-left p-2.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border flex items-center justify-between text-xs text-white transition"
              >
                <div className="flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-teal-400" />
                  <span>Request Faculty Meeting / Query</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
