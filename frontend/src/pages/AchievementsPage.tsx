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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { Achievement, EventCategory } from '../types';

interface AchievementsPageProps {
  onOpenSubmitModal: () => void;
}

export const AchievementsPage: React.FC<AchievementsPageProps> = ({ onOpenSubmitModal }) => {
  const { user, isAdminOrPresident, isAdminOrHOD } = useAuth();
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
          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Verified & Approved
          </span>
        );
      case 'PENDING':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
            <Clock className="w-3.5 h-3.5 text-amber-600" /> Pending Review
          </span>
        );
      case 'CHANGES_REQUESTED':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <AlertCircle className="w-3.5 h-3.5 text-blue-600" /> Changes Requested
          </span>
        );
      case 'REJECTED':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" /> Rejected
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
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <Trophy className="w-5 h-5" />
            </div>
            <span>Hackathons & Student Achievements</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Audited student competition records, evidence certificates, and merit points gallery.
          </p>
        </div>

        <button
          onClick={onOpenSubmitModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 hover:shadow-lg flex items-center gap-2 shrink-0 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Achievement</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean space-y-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'APPROVED', 'PENDING', 'CHANGES_REQUESTED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Submissions' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search title, student, event..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Category:</span>
          <button
            onClick={() => setCategoryFilter('ALL')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
              categoryFilter === 'ALL'
                ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            All Categories
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(String(c.id))}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                categoryFilter === String(c.id)
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Achievements Cards Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading verified achievements...</div>
      ) : achievements.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200 shadow-clean">
          <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">No achievements found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search query or submit your first hackathon record to earn points!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className="rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-clean-md transition-all p-6 flex flex-col justify-between group shadow-clean"
            >
              <div>
                {/* Header: Status + Points Badge */}
                <div className="flex items-center justify-between gap-2 mb-3.5">
                  {statusBadge(ach.status)}
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-xs font-bold">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>+{ach.points_awarded || 0} PTS</span>
                  </div>
                </div>

                {/* Title and Event */}
                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {ach.title}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 font-medium">
                  <span className="font-semibold text-slate-700">{ach.event_name}</span>
                  <span>•</span>
                  <span>{ach.category_name}</span>
                </div>

                {/* Submitter & Level Details */}
                <div className="mt-4 p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Student:</span>
                    <span className="font-bold text-slate-900">
                      {ach.student_name} ({ach.roll_number})
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Achievement Level:</span>
                    <span className="font-bold text-blue-600">{ach.level_label}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Event Date:</span>
                    <span className="text-slate-700">{ach.event_date}</span>
                  </div>
                  {ach.is_team && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-200/60">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Users className="w-3.5 h-3.5 text-blue-600" /> Team Name:
                      </span>
                      <span className="text-blue-700 font-semibold">{ach.team_name || 'Team Entry'}</span>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p className="text-xs text-slate-600 mt-3 line-clamp-3 leading-relaxed">
                  {ach.description}
                </p>

                {/* Skills tags */}
                {ach.skills_used && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {ach.skills_used.split(',').map((skill, i) => (
                      <span
                        key={i}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                )}

                {/* Evidence Attachments */}
                {ach.evidence && ach.evidence.length > 0 && (
                  <div className="mt-3.5 pt-3 border-t border-slate-100">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Verified Credentials & Certificates:
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {ach.evidence.map((ev) => (
                        <a
                          key={ev.id}
                          href={ev.file || ev.external_url || '#'}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-semibold transition-colors border border-blue-200"
                        >
                          <FileText className="w-3.5 h-3.5" />
                          <span>{ev.caption || ev.evidence_type}</span>
                          <ExternalLink className="w-3 h-3 text-blue-400" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Reviewer Feedback Notes */}
                {ach.reviewer_feedback && (
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
                    <span className="font-bold text-slate-500 block text-[10px] uppercase tracking-wider mb-0.5">
                      Reviewer Feedback ({ach.reviewed_by_name}):
                    </span>
                    <span className="italic">"{ach.reviewer_feedback}"</span>
                  </div>
                )}
              </div>

              {/* Card Footer Actions */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  Submitted {new Date(ach.created_at).toLocaleDateString()}
                </span>

                {(isAdminOrPresident || isAdminOrHOD) && (
                  <button
                    onClick={() => handleOpenReview(ach)}
                    className="px-3.5 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white border border-blue-200 hover:border-transparent text-xs font-bold transition-all shadow-2xs"
                  >
                    Verify / Review
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Review Modal for Admin / HOD / President */}
      {selectedAchievement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedAchievement(null)}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Review & Verify Achievement</h3>
            <p className="text-xs text-slate-500 mb-4">
              Submission: <span className="text-slate-800 font-bold">{selectedAchievement.title}</span> by{' '}
              {selectedAchievement.student_name}
            </p>

            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Decision Action</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewAction('APPROVE')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      reviewAction === 'APPROVE'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('CHANGES_REQUESTED')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      reviewAction === 'CHANGES_REQUESTED'
                        ? 'bg-blue-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Request Info
                  </button>
                  <button
                    type="button"
                    onClick={() => setReviewAction('REJECT')}
                    className={`py-2.5 rounded-xl text-xs font-bold transition-all ${
                      reviewAction === 'REJECT'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    Reject
                  </button>
                </div>
              </div>

              {reviewAction === 'APPROVE' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Points to Award (Immutable Ledger Transaction)
                  </label>
                  <input
                    type="number"
                    value={reviewPoints}
                    onChange={(e) => setReviewPoints(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Points will be atomically recorded in the non-negative PointLedger.
                  </span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Reviewer Feedback Notes</label>
                <textarea
                  rows={3}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="Official comments visible to the student..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setSelectedAchievement(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={reviewing}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
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
