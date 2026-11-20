import React, { useState, useEffect } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  Filter,
  CheckCircle,
  Clock,
  Shield,
  Send,
  User,
  Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { DepartmentQuery } from '../types';

interface FeedbackPageProps {
  onOpenQueryModal: () => void;
}

export const FeedbackPage: React.FC<FeedbackPageProps> = ({ onOpenQueryModal }) => {
  const { user, isFaculty, isAdminOrPresident } = useAuth();
  const [queries, setQueries] = useState<DepartmentQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  
  // Selected Query for reply
  const [selectedQuery, setSelectedQuery] = useState<DepartmentQuery | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  const loadQueries = async () => {
    try {
      setLoading(true);
      const params = [];
      if (categoryFilter !== 'ALL') params.push(`category=${categoryFilter}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);

      const data = await api.feedback.list(params.join('&'));
      setQueries(data);
      if (selectedQuery) {
        const refreshed = data.find((q: DepartmentQuery) => q.id === selectedQuery.id);
        if (refreshed) setSelectedQuery(refreshed);
      }
    } catch (err) {
      console.error('Error loading queries:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQueries();
  }, [categoryFilter, search]);

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuery || !replyText.trim()) return;

    try {
      setSubmittingReply(true);
      await api.feedback.addResponse(selectedQuery.id, {
        response_text: replyText,
      });
      setReplyText('');
      loadQueries();
    } catch (err: any) {
      alert(err.message || 'Failed to send response');
    } finally {
      setSubmittingReply(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <MessageSquare className="w-6 h-6 text-cyan-400" />
            <span>Student Feedback & Academic Queries Desk</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Submit questions, request faculty appointments, or share constructive suggestions with optional privacy protection.
          </p>
        </div>

        <button
          onClick={onOpenQueryModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-sm flex items-center gap-2 shrink-0 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Ask Department Query</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs">
          <span className="text-[11px] font-semibold text-gray-500 shrink-0">Category:</span>
          {['ALL', 'ACADEMIC', 'TIMETABLE', 'FACULTY_MEETING', 'HACKATHON_EVENT', 'SUGGESTION'].map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition shrink-0 ${
                categoryFilter === c
                  ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-surface-elevated'
              }`}
            >
              {c === 'ALL' ? 'All Queries' : c.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search queries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Two-Pane Layout: Queries List on Left, Thread Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Query List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="py-12 text-center text-xs text-gray-400">Loading queries...</div>
          ) : queries.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-surface border border-dashed border-surface-border text-xs text-gray-500">
              No queries found matching the selected filter.
            </div>
          ) : (
            queries.map((q) => (
              <div
                key={q.id}
                onClick={() => setSelectedQuery(q)}
                className={`p-4 rounded-xl border transition cursor-pointer ${
                  selectedQuery?.id === q.id
                    ? 'bg-surface-elevated border-cyan-500/50 shadow-sm'
                    : 'bg-surface border-surface-border hover:border-surface-hover'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span className="font-mono text-[10px] font-bold text-gray-400 px-1.5 py-0.5 rounded bg-surface">
                    {q.reference_id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      q.status === 'RESPONSE_PROVIDED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {q.status_label}
                  </span>
                </div>

                <h3 className="font-bold text-xs text-white line-clamp-1">{q.subject}</h3>
                <p className="text-[11px] text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                  {q.description}
                </p>

                <div className="mt-3 pt-2 border-t border-surface-border/60 flex items-center justify-between text-[10px] text-gray-500">
                  <div className="flex items-center gap-1.5">
                    {q.is_anonymous ? (
                      <span className="flex items-center gap-1 text-gray-400 font-semibold">
                        <Shield className="w-3 h-3 text-cyan-400" /> Anonymous
                      </span>
                    ) : (
                      <span>{q.student_name}</span>
                    )}
                  </div>
                  <span>{q.responses?.length || 0} response(s)</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Selected Query Thread & Reply Desk (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedQuery ? (
            <div className="rounded-xl bg-surface border border-surface-border p-5 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-gray-400">
                    {selectedQuery.reference_id} • {selectedQuery.category_label}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase ${
                      selectedQuery.status === 'RESPONSE_PROVIDED'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-cyan-500/20 text-cyan-300'
                    }`}
                  >
                    {selectedQuery.status_label}
                  </span>
                </div>
                <h2 className="text-base font-bold text-white">{selectedQuery.subject}</h2>
                <div className="flex items-center gap-3 text-xs text-gray-400 mt-1">
                  <span>From: {selectedQuery.student_name}</span>
                  {selectedQuery.target_faculty_name && (
                    <span>• Directed to: {selectedQuery.target_faculty_name}</span>
                  )}
                </div>
              </div>

              {/* Inquiry Body */}
              <div className="p-3.5 rounded-xl bg-surface-elevated/70 border border-surface-border text-xs text-gray-200 leading-relaxed">
                {selectedQuery.description}
              </div>

              {/* Responses Thread */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Responses & Guidance ({selectedQuery.responses?.length || 0})
                </h3>

                {selectedQuery.responses?.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500 rounded-lg bg-surface-elevated/40 border border-dashed border-surface-border">
                    No response has been posted yet. Faculty or department coordinators will reply shortly.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedQuery.responses.map((resp) => (
                      <div
                        key={resp.id}
                        className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-cyan-300">
                            {resp.responder_name} ({resp.responder_role})
                          </span>
                          <span className="text-[10px] text-gray-500">
                            {new Date(resp.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-gray-200 leading-relaxed">{resp.response_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Response Input (for faculty / admin or general reply) */}
              {(isFaculty || isAdminOrPresident) && (
                <form onSubmit={handleSendReply} className="pt-4 border-t border-surface-border space-y-3">
                  <h4 className="text-xs font-bold text-white">Post Department Response</h4>
                  <textarea
                    rows={3}
                    placeholder="Type official response or meeting confirmation to student..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReply}
                      className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 text-white font-semibold text-xs flex items-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingReply ? 'Sending...' : 'Send Response'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center p-8 rounded-xl bg-surface border border-dashed border-surface-border text-center text-xs text-gray-500">
              Select a query from the list to view the full inquiry thread and official responses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
