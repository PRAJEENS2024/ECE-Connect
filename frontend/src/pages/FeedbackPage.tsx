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
  const { user, isFaculty, isAdminOrPresident, isAdminOrHOD } = useAuth();
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
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <MessageSquare className="w-5 h-5" />
            </div>
            <span>Student Feedback & Academic Queries Desk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Submit questions, request faculty appointments, or share suggestions with optional privacy protection.
          </p>
        </div>

        <button
          onClick={onOpenQueryModal}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 hover:shadow-lg flex items-center gap-2 shrink-0 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Ask Department Query</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Category:</span>
          {['ALL', 'ACADEMIC', 'TIMETABLE', 'FACULTY_MEETING', 'HACKATHON_EVENT', 'SUGGESTION'].map((c) => (
            <button
              key={c}
              onClick={() => setCategoryFilter(c)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                categoryFilter === c
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {c === 'ALL' ? 'All Queries' : c.replace('_', ' ')}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search queries..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
          />
        </div>
      </div>

      {/* Two-Pane Layout: Queries List on Left, Thread Detail on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Query List (5 Cols) */}
        <div className="lg:col-span-5 space-y-3">
          {loading ? (
            <div className="py-16 text-center text-xs text-slate-400">Loading queries...</div>
          ) : queries.length === 0 ? (
            <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200 text-xs text-slate-500 shadow-clean">
              No queries found matching the selected filter.
            </div>
          ) : (
            queries.map((q) => (
              <div
                key={q.id}
                onClick={() => setSelectedQuery(q)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer shadow-clean ${
                  selectedQuery?.id === q.id
                    ? 'bg-blue-50/40 border-blue-400 shadow-clean-md'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-[10px] font-bold text-slate-700 px-2 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                    {q.reference_id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      q.status === 'RESPONSE_PROVIDED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {q.status_label}
                  </span>
                </div>

                <h3 className="font-bold text-sm text-slate-900 line-clamp-1">{q.subject}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                  {q.description}
                </p>

                <div className="mt-3.5 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-1.5">
                    {q.is_anonymous ? (
                      <span className="flex items-center gap-1 text-slate-600 font-bold">
                        <Shield className="w-3.5 h-3.5 text-blue-600" /> Anonymous Student
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-700">{q.student_name}</span>
                    )}
                  </div>
                  <span className="text-slate-500 font-medium">{q.responses?.length || 0} response(s)</span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right: Selected Query Thread & Reply Desk (7 Cols) */}
        <div className="lg:col-span-7">
          {selectedQuery ? (
            <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-6 shadow-clean">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="font-mono text-xs font-bold text-slate-500">
                    {selectedQuery.reference_id} • {selectedQuery.category_label}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase border ${
                      selectedQuery.status === 'RESPONSE_PROVIDED'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-blue-50 text-blue-700 border-blue-200'
                    }`}
                  >
                    {selectedQuery.status_label}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-900">{selectedQuery.subject}</h2>
                <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                  <span>From: <strong className="text-slate-700">{selectedQuery.student_name}</strong></span>
                  {selectedQuery.target_faculty_name && (
                    <span>• Directed to: <strong className="text-slate-800">{selectedQuery.target_faculty_name}</strong></span>
                  )}
                </div>
              </div>

              {/* Inquiry Body */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed">
                {selectedQuery.description}
              </div>

              {/* Responses Thread */}
              <div>
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                  Responses & Guidance ({selectedQuery.responses?.length || 0})
                </h3>

                {selectedQuery.responses?.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-slate-50/60 border border-dashed border-slate-200">
                    No response has been posted yet. Faculty or department coordinators will reply shortly.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedQuery.responses.map((resp) => (
                      <div
                        key={resp.id}
                        className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-blue-700">
                            {resp.responder_name} ({resp.responder_role})
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {new Date(resp.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-slate-800 leading-relaxed font-medium">{resp.response_text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Response Input (for faculty / admin or general reply) */}
              {(isFaculty || isAdminOrPresident || isAdminOrHOD) && (
                <form onSubmit={handleSendReply} className="pt-4 border-t border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Post Department Response</h4>
                  <textarea
                    rows={3}
                    placeholder="Type official response or meeting confirmation to student..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={submittingReply}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg flex items-center gap-2 transition-all"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{submittingReply ? 'Sending...' : 'Send Response'}</span>
                    </button>
                  </div>
                </form>
              )}
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex items-center justify-center p-8 rounded-2xl bg-white border border-dashed border-slate-200 text-center text-xs text-slate-500 shadow-clean">
              Select a query from the list to view the full inquiry thread and official responses.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
