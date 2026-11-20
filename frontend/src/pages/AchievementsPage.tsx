import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Filter,
  Search,
  Plus,
  CheckCircle,
  Clock,
  AlertCircle,
  ExternalLink,
  Users,
  Sparkles,
  FileText,
  Calendar,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../../src/api/client';
import { Achievement, EventCategory } from '../../src/types';

interface AchievementsPageProps {
  onOpenSubmitModal: () => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onOpenSubmitModal }) => {
  const { user, isAdminOrPresident } = useAuth();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [categories, setCategories] = useState<EventCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');

  // Review modal state
  const [selectedAchievement, setSelectedAchievement] = useState<Achievement | null>(null);
  const [reviewAction, setReviewAction] = useState<'APPROVE' | 'REJECT' | 'CHANGES_REQUESTED'>('APPROVE');
  const [reviewPoints, setReviewPoints] = useState<number>(100);
  const [reviewFeedback, setReviewFeedback] = useState<string>('');
  const [reviewing, setReviewing] = useState<boolean>(false);

  const loadData = async () => {
    try {
      setLoading(true);
      let queryParams = [];
      if (statusFilter !== 'ALL') queryParams.push(`status=${statusFilter}`);
      if (categoryFilter !== 'ALL') queryParams.push(`category=${categoryFilter}`);
      if (search) queryParams.push(`search=${encodeURIComponent(search)}`);

      const [achData, catData] = await Promise.all([
        api.achievements.list(queryParams.join('&')),
        api.achievements.getCategories(),
      ]);

      setAchievements(achData);
      setCategories(catData);
    } catch (err) {
      console.error('Error loading achievements:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [statusFilter, categoryFilter, search]);

  const handleOpenReview = (ach: Achievement) => {
    setSelectedAchievement(ach);
    setReviewPoints(ach.points_awarded || 100);
    setReviewFeedback(ach.reviewer_feedback || '');
    setReviewAction('APPROVE');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAchievement) return;

    try {
      setReviewing(true);
      await api.achievements.review(selectedAchievement.id, {
        action: reviewAction,
        points: reviewPoints,
        feedback: reviewFeedback,
      });
      setSelectedAchievement(null);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Review failed');
    } finally {
      setReviewing(false);
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3" /> Verified & Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            <AlertCircle className="w-3 h-3" /> Changes Requested
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3 h-3" /> Rejected
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <span>Hackathons & Achievement Tracking</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Verified student competition records, evidence certificates, and merit points gallery.
          </p>
        </div>

        <button
          onClick={onOpenSubmitModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-sm hover:shadow-glow-teal flex items-center gap-2 shrink-0 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Achievement</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'APPROVED', 'PENDING', 'CHANGES_REQUESTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  statusFilter === st
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-surface-elevated'
                }`}
              >
                {st === 'ALL' ? 'All Submissions' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, student, event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-surface-border/50 text-xs">
          <span className="text-[11px] font-semibold text-gray-500 shrink-0">Category:</span>
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-2.5 py-1 rounded-md text-[11px] transition shrink-0 ${
              categoryFilter === 'ALL'
                ? 'bg-surface-elevated text-white font-bold border border-surface-border'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            All
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(String(c.id))}
              className={`px-2.5 py-1 rounded-md text-[11px] transition shrink-0 ${
                categoryFilter === String(c.id)
                  ? 'bg-surface-elevated text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Cards Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading achievements...</div>
      ) : achievements.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-surface border border-dashed border-surface-border">
          <Trophy className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No achievements found</h3>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or submit your first hackathon record to earn points!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="rounded-xl bg-surface border border-surface-border hover:border-cyan-500/40 transition p-5 flex flex-col justify-between group shadow-sm"
            >
              <div>
                {/* Header: Status + Points Badge */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  {statusBadge(ach.status)}
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>+{ach.points_awarded || 0} PTS</span>
                  </div>
                </div>

                {/* Title and Event */}
                <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition leading-snug">
                  {ach.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-gray-400 font-medium">
                  <span>{ach.event_name}</span>
                  <span>•</span>
                  <span>{ach.category_name}</span>
                </div>

                {/* Submitter & Level Details */}
                <div className="mt-3.5 p-3 rounded-lg bg-surface-elevated/60 border border-surface-border text-xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Student:</span>
                    <span className="font-semibold text-white">
                      {ach.student_name} ({ach.roll_number})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Achievement Level:</span>
                    <span className="font-bold text-amber-400">{ach.level_label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-400">Event Date:</span>
                    <span className="text-gray-300">{ach.event_date}</span>
                  </div>
                  {ach.is_team && (
                    <div className="flex items-center justify-between pt-1 border-t border-white/5">
                      <span className="text-gray-400 flex items-center gap-1">
                        <Users className="w-3 h-3 text-cyan-400" /> Team:
                      </span>
                      <span className="text-cyan-300 font-medium">{ach.team_name || 'Team Entry'}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-gray-300 mt-3 line-clamp-3 leading-relaxed">
                  {ach.description}
                </p>

                {/* Skills tags */}
                {ach.skills_used && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {ach.skills_used.split(',').map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-surface-elevated text-gray-400 border border-surface-border"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Evidence Attachments */}
                {ach.evidence && ach.evidence.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-surface-border/60">
                    <span className="text-[11px] font-semibold text-gray-400 block mb-1.5">
                      Attached Evidence:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ach.evidence.map((ev) => (
                        <a
                          key={ev.id}
                          href={ev.file || ev.external_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-cyan-500/10 hover:bg-cyan-500/20 text-brand-cyan text-[11px] font-medium transition border border-cyan-500/20"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{ev.caption || ev.evidence_type}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviewer Feedback Notes */}
                {ach.reviewer_feedback && (
                  <div className="mt-3 p-2.5 rounded bg-surface-elevated/80 border border-white/10 text-[11px] text-gray-300">
                    <span className="font-bold text-gray-400 block text-[10px] uppercase">
                      Reviewer Feedback ({ach.reviewed_by_name}):
                    </span>
                    <span className="italic">"{ach.reviewer_feedback}"</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
                <span className="text-[10px] text-gray-500">
                  Submitted {new Date(ach.created_at).toLocaleDateString()}
                </span>

                {isAdminOrPresident && (
                  <button
                    onClick={() => handleOpenReview(ach)}
                    className="px-3 py-1 rounded-lg bg-surface-elevated hover:bg-cyan-500/20 text-brand-cyan border border-cyan-500/30 text-xs font-semibold transition"
                  >
                    Verify / Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal for Admin / President */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-surface border border-surface-border rounded-2xl shadow-2xl p-6">
            <h3 className="text-base font-bold text-white mb-2">Review & Verify Achievement</h3>
            <p className="text-xs text-gray-400 mb-4">
              Submission: <span className="text-white font-semibold">{selectedAchievement.title}</span> by{' '}
              {selectedAchievement.student_name}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Decision Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('APPROVE')}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      reviewAction === 'APPROVE'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                        : 'bg-surface-elevated text-gray-400'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('CHANGES_REQUESTED')}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      reviewAction === 'CHANGES_REQUESTED'
                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                        : 'bg-surface-elevated text-gray-400'
                    }`}
                  >
                    Request Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('REJECT')}
                    className={`py-2 rounded-lg text-xs font-bold transition ${
                      reviewAction === 'REJECT'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        : 'bg-surface-elevated text-gray-400'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {reviewAction === 'APPROVE' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1">
                    Points to Award (Ledger Transaction)
                  </label>
                  <input
                    type="number"
                    value={reviewPoints}
                    onChange={(e) => setReviewPoints(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block">
                    Points will be atomically recorded in the immutable PointLedger.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1">Reviewer Feedback Notes</label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Official comments visible to the student..."
                  className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-border">
                <button
                  type="button"
                  onClick={() => setSelectedAchievement(null)}
                  className="px-4 py-2 rounded-lg bg-surface-elevated text-gray-300 text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="px-5 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 text-white font-semibold text-xs shadow-sm"
                >
                  {reviewing ? 'Saving...' : 'Submit Verification'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
