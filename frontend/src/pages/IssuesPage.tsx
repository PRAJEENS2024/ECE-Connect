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
  const { user, isAdminOrPresident } = useAuth();
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
      // update selected issue if open
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
        return 'bg-rose-500/20 text-rose-300 border-rose-500/40';
      case 'HIGH':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'MEDIUM':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      default:
        return 'bg-surface-elevated text-gray-400 border-surface-border';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            <span>Classroom Issue & Maintenance Ticketing</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time reporting for projectors, ceiling fans, dry markers, dusters, and lab infrastructure.
          </p>
        </div>

        <button
          onClick={onOpenReportModal}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-semibold text-xs transition shadow-sm flex items-center gap-2 shrink-0 self-start"
        >
          <Plus className="w-4 h-4" />
          <span>Report Maintenance Issue</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-xl bg-surface border border-surface-border space-y-3">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Status Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0">
            {['ALL', 'SUBMITTED', 'IN_PROGRESS', 'RESOLVED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                  statusFilter === st
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'text-gray-400 hover:text-white hover:bg-surface-elevated'
                }`}
              >
                {st === 'ALL' ? 'All Issues' : st.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Search Box */}
          <div className="relative w-full md:w-64">
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search reference, room, equipment..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
            />
          </div>
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pt-1 border-t border-surface-border/50 text-xs">
          <span className="text-[11px] font-semibold text-gray-500 shrink-0">Priority:</span>
          {['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'].map((p) => (
            <button
              key={p}
              onClick={() => setPriorityFilter(p)}
              className={`px-2.5 py-1 rounded-md text-[11px] transition shrink-0 ${
                priorityFilter === p
                  ? 'bg-surface-elevated text-white font-bold border border-surface-border'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Issues Grid */}
      {loading ? (
        <div className="py-12 text-center text-xs text-gray-400">Loading issue reports...</div>
      ) : issues.length === 0 ? (
        <div className="py-16 text-center rounded-2xl bg-surface border border-dashed border-surface-border">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-white">No active issues found</h3>
          <p className="text-xs text-gray-400 mt-1">All classroom and laboratory hardware are operational.</p>
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
              className="rounded-xl bg-surface border border-surface-border hover:border-rose-500/40 transition p-5 flex flex-col justify-between cursor-pointer group shadow-sm"
            >
              <div>
                {/* Header: Ref ID + Priority */}
                <div className="flex items-center justify-between gap-2 mb-2.5">
                  <span className="font-mono text-[11px] font-bold text-gray-400 px-2 py-0.5 rounded bg-surface-elevated">
                    {iss.reference_id}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${priorityColor(iss.priority)}`}>
                    {iss.priority}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-sm text-white group-hover:text-rose-300 transition leading-snug">
                  {iss.title}
                </h3>

                {/* Location and Equipment Details */}
                <div className="mt-3 p-2.5 rounded-lg bg-surface-elevated/60 border border-surface-border text-xs space-y-1 text-gray-300">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-semibold">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span>
                      {iss.room_details?.room_number || iss.building} (Floor {iss.floor})
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-gray-400 pt-1">
                    <span>Equipment:</span>
                    <span className="text-gray-200 font-medium">{iss.item_equipment}</span>
                  </div>
                </div>

                <p className="text-xs text-gray-400 mt-3 line-clamp-2 leading-relaxed">
                  {iss.description}
                </p>
              </div>

              {/* Lifecycle Status Bar */}
              <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between">
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

                <span className="text-[10px] text-gray-500">
                  {new Date(iss.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Issue Detail & Timeline Drawer / Modal */}
      {selectedIssue && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-surface border border-surface-border rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => setSelectedIssue(null)}
              className="absolute top-5 right-5 text-gray-400 hover:text-white p-1 rounded-lg hover:bg-surface-elevated transition"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <span className="font-mono text-xs font-bold text-gray-400 px-2 py-1 rounded bg-surface-elevated">
                {selectedIssue.reference_id}
              </span>
              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${priorityColor(selectedIssue.priority)}`}>
                {selectedIssue.priority} Priority
              </span>
            </div>

            <h2 className="text-lg font-bold text-white mb-2">{selectedIssue.title}</h2>
            <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border text-xs grid grid-cols-2 gap-2 text-gray-300 mb-4">
              <div>
                <span className="text-gray-500 block text-[10px]">Location:</span>
                <span className="font-semibold text-white">
                  {selectedIssue.room_details?.room_number || selectedIssue.building} (Floor {selectedIssue.floor})
                </span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Equipment:</span>
                <span className="font-semibold text-white">{selectedIssue.item_equipment}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Reported By:</span>
                <span>{selectedIssue.reported_by_name}</span>
              </div>
              <div>
                <span className="text-gray-500 block text-[10px]">Current Status:</span>
                <span className="font-bold text-cyan-400">{selectedIssue.status_label}</span>
              </div>
            </div>

            <p className="text-xs text-gray-300 leading-relaxed mb-6 bg-surface-elevated/30 p-3 rounded-lg border border-surface-border">
              {selectedIssue.description}
            </p>

            {/* Timeline History */}
            <div className="mb-6">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                Resolution Timeline
              </h3>
              <div className="space-y-3 relative pl-4 border-l border-surface-border ml-2">
                {selectedIssue.timeline?.map((entry) => (
                  <div key={entry.id} className="relative">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 absolute -left-[21px] top-1" />
                    <div className="text-xs">
                      <span className="font-bold text-white">{entry.action.replace('_', ' ')}</span>
                      <span className="text-gray-500 text-[10px] ml-2">
                        {new Date(entry.created_at).toLocaleString()}
                      </span>
                    </div>
                    {entry.note && <p className="text-[11px] text-gray-400 mt-0.5">{entry.note}</p>}
                    <span className="text-[10px] text-gray-500">By {entry.actor_name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Admin / President Action Box */}
            {isAdminOrPresident && (
              <form onSubmit={handleUpdateStatus} className="p-4 rounded-xl bg-surface-elevated border border-surface-border space-y-3">
                <h4 className="text-xs font-bold text-white">Department Action / Update Status</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">New Status</label>
                    <select
                      value={newStatus}
                      onChange={(e) => setNewStatus(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
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
                    <label className="block text-[11px] text-gray-400 mb-1">Progress Note / Repair Details</label>
                    <input
                      type="text"
                      placeholder="e.g. Replaced HDMI wall plate and tested display."
                      value={statusNote}
                      onChange={(e) => setStatusNote(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-surface border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 text-white font-semibold text-xs transition"
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
