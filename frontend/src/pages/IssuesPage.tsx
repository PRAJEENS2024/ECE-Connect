import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Plus,
  Filter,
  CheckCircle2,
  Clock,
  Wrench,
  Search,
  MapPin,
  X,
  UserCheck,
  Send,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { IssueReport } from '../types';

interface IssuesPageProps {
  onOpenReportModal: () => void;
}

export const IssuesPage: React.FC<IssuesPageProps> = ({ onOpenReportModal }) => {
  const { user, isAdminOrPresident, isAdminOrHOD } = useAuth();
  const [issues, setIssues] = useState<IssueReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Selected Issue for Drawer
  const [selectedIssue, setSelectedIssue] = useState<IssueReport | null>(null);
  const [newStatus, setNewStatus] = useState<string>('IN_PROGRESS');
  const [statusNote, setStatusNote] = useState<string>('');
  const [updating, setUpdating] = useState<boolean>(false);

  const loadIssues = async () => {
    try {
      setLoading(true);
      const params = [];
      if (statusFilter !== 'ALL') params.push(`status=${statusFilter}`);
      if (categoryFilter !== 'ALL') params.push(`category=${categoryFilter}`);
      if (priorityFilter !== 'ALL') params.push(`priority=${priorityFilter}`);
      if (search) params.push(`search=${encodeURIComponent(search)}`);

      const data = await api.issues.list(params.join('&'));
      setIssues(data);
      if (selectedIssue) {
        const refreshed = data.find((i: IssueReport) => i.id === selectedIssue.id);
        if (refreshed) setSelectedIssue(refreshed);
      }
    } catch (err) {
      console.error('Error loading issues:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues();
  }, [statusFilter, categoryFilter, priorityFilter, search]);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIssue) return;

    try {
      setUpdating(true);
      const updated = await api.issues.updateStatus(selectedIssue.id, {
        status: newStatus,
        note: statusNote,
      });
      setSelectedIssue(updated);
      setStatusNote('');
      loadIssues();
    } catch (err: any) {
      alert(err.message || 'Status update failed');
    } finally {
      setUpdating(false);
    }
  };

  const priorityColor = (p: string) => {
    switch (p) {
      case 'URGENT':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'HIGH':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-200">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <span>Classroom Issue & Maintenance Helpdesk</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time ticketing for projectors, ceiling fans, whiteboard markers, dusters, and laboratory hardware.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition-all shadow-md shadow-rose-500/20 hover:shadow-lg flex items-center gap-2 shrink-0 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Report Issue</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean space-y-3.5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All Issues' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, room, equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pt-2 border-t border-slate-100 text-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Priority:</span>
          {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                priorityFilter === p
                  ? 'bg-blue-50 text-blue-700 font-bold border border-blue-200'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="py-16 text-center text-xs text-slate-400">Loading issue reports...</div>
      ) : issues.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-white border border-dashed border-slate-200 shadow-clean">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-900">No active maintenance issues found</h3>
          <p className="text-xs text-slate-500 mt-1">All classroom and laboratory hardware are operational.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {issues.map((iss) => (
            <div
              key={iss.id}
              onClick={() => {
                setSelectedIssue(iss);
                setNewStatus(iss.status);
              }}
              className="rounded-2xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-clean-md transition-all p-6 flex flex-col justify-between cursor-pointer group shadow-clean"
            >
              <div>
                {/* Header: Ref ID + Priority */}
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="font-mono text-[11px] font-bold text-slate-700 px-2.5 py-0.5 rounded-lg bg-slate-100 border border-slate-200">
                    {iss.reference_id}
                  </span>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${priorityColor(iss.priority)}`}>
                    {iss.priority}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors leading-snug">
                  {iss.title}
                </h3>

                {/* Location and Equipment Details */}
                <div className="mt-3.5 p-3 rounded-xl bg-slate-50/70 border border-slate-200/80 text-xs space-y-1.5 text-slate-700">
                  <div className="flex items-center gap-1.5 text-blue-700 font-semibold">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {iss.room_details?.room_number || iss.building} (Floor {iss.floor})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
                    <span>Equipment / Item:</span>
                    <span className="text-slate-800 font-bold">{iss.item_equipment}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                  {iss.description}
                </p>
              </div>

              {/* Lifecycle Status Bar */}
              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
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

                <span className="text-[11px] text-slate-400">
                  {new Date(iss.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Detail & Timeline Drawer / Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedIssue(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1.5 rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-3">
              <span className="font-mono text-xs font-bold text-slate-700 px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200">
                {selectedIssue.reference_id}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${priorityColor(selectedIssue.priority)}`}>
                {selectedIssue.priority} Priority
              </span>
            </div>

            <h2 className="text-xl font-bold text-slate-900 mb-2">{selectedIssue.title}</h2>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs grid grid-cols-2 gap-3 text-slate-700 mb-5">
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Location:</span>
                <span className="font-bold text-slate-900">
                  {selectedIssue.room_details?.room_number || selectedIssue.building} (Floor {selectedIssue.floor})
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Equipment:</span>
                <span className="font-bold text-slate-900">{selectedIssue.item_equipment}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Reported By:</span>
                <span className="font-medium text-slate-800">{selectedIssue.reported_by_name}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] font-bold uppercase tracking-wider">Current Status:</span>
                <span className="font-bold text-blue-600">{selectedIssue.status_label}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed mb-6 bg-slate-50/60 p-4 rounded-xl border border-slate-200/80">
              {selectedIssue.description}
            </p>

            {/* Timeline History */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Resolution Timeline
              </h3>
              <div className="space-y-3 relative pl-4 border-l-2 border-slate-200 ml-2">
                {selectedIssue.timeline?.map((entry) => (
                  <div key={entry.id} className="relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-600 absolute -left-[21px] top-1 ring-4 ring-blue-50" />
                    <div className="text-xs">
                      <span className="font-bold text-slate-900">{entry.action.replace('_', ' ')}</span>
                      <span className="text-slate-400 text-[10px] ml-2 font-mono">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    {entry.note && <p className="text-[11px] text-slate-600 mt-0.5">{entry.note}</p>}
                    <span className="text-[10px] text-slate-400">By {entry.actor_name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin / President Action Box */}
            {(isAdminOrPresident || isAdminOrHOD) && (
              <form onSubmit={handleUpdateStatus} className="p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Department Action / Update Maintenance Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
                    >
                      <option value="SUBMITTED">Submitted</option>
                      <option value="ACKNOWLEDGED">Acknowledged</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="WAITING_FOR_PARTS">Waiting for Parts</option>
                      <option value="RESOLVED">Resolved (Awards Community Points)</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Progress Note / Repair Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Replaced HDMI wall plate and tested display."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all"
                  >
                    {updating ? 'Updating...' : 'Update Status & Notify Reporter'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
