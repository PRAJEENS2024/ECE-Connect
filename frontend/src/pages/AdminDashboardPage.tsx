import React, { useState, useEffect } from 'react';
import {
  Shield,
  Trophy,
  AlertTriangle,
  Play,
  RotateCw,
  CheckCircle2,
  Clock,
  Sparkles,
  BarChart2,
  Database,
  Users,
  FileSpreadsheet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../api/client';
import { DashboardKPIs, Achievement, IssueReport } from '../types';

export const AdminDashboardPage: React.FC = () => {
  const [data, setData] = useState<DashboardKPIs | null>(null);
  const [pendingAchievements, setPendingAchievements] = useState<Achievement[]>([]);
  const [urgentIssues, setUrgentIssues] = useState<IssueReport[]>([]);
  const [etlHistory, setEtlHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [runningETL, setRunningETL] = useState(false);
  const [etlResult, setEtlResult] = useState<any | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [kpiRes, achRes, issRes, etlRes] = await Promise.all([
        api.analytics.getKPIs(),
        api.achievements.list('status=PENDING'),
        api.issues.list('priority=URGENT'),
        api.analytics.getETLHistory(),
      ]);

      setData(kpiRes);
      setPendingAchievements(achRes);
      setUrgentIssues(issRes);
      setEtlHistory(etlRes);
    } catch (err) {
      console.error('Error loading admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRunETL = async () => {
    try {
      setRunningETL(true);
      const res = await api.analytics.triggerETL();
      setEtlResult(res);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'ETL run failed');
    } finally {
      setRunningETL(false);
    }
  };

  const handleQuickApprove = async (ach: Achievement) => {
    try {
      await api.achievements.review(ach.id, {
        action: 'APPROVE',
        points: ach.points_awarded || 100,
        feedback: 'Verified by Department Administration.',
      });
      loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const PIE_COLORS = ['#06B6D4', '#F59E0B', '#10B981', '#8B5CF6', '#F43F5E'];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-white flex items-center gap-2">
            <Shield className="w-6 h-6 text-amber-400" />
            <span>Department Operations & Analytics Command Center</span>
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Real-time management for ECE Student President, Coordinators, and HOD administration.
          </p>
        </div>

        <button
          onClick={handleRunETL}
          disabled={runningETL}
          className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-sm hover:shadow-glow-teal flex items-center gap-2 shrink-0 self-start"
        >
          <RotateCw className={`w-4 h-4 ${runningETL ? 'animate-spin' : ''}`} />
          <span>{runningETL ? 'Executing Pipeline...' : 'Run Python ETL Pipeline'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
          <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
            <span className="text-[11px] font-semibold text-gray-400 block">Registered Students</span>
            <span className="text-xl font-black text-white">{data.kpis.total_students}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
            <span className="text-[11px] font-semibold text-gray-400 block">Faculty Members</span>
            <span className="text-xl font-black text-white">{data.kpis.total_faculty}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
            <span className="text-[11px] font-semibold text-gray-400 block">Verified Achievements</span>
            <span className="text-xl font-black text-cyan-400">{data.kpis.verified_achievements}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
            <span className="text-[11px] font-semibold text-gray-400 block">Pending Reviews</span>
            <span className="text-xl font-black text-amber-400">{data.kpis.pending_achievements}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
            <span className="text-[11px] font-semibold text-gray-400 block">Open Issues</span>
            <span className="text-xl font-black text-rose-400">{data.kpis.open_issues}</span>
          </div>

          <div className="p-3.5 rounded-xl bg-surface border border-surface-border">
            <span className="text-[11px] font-semibold text-gray-400 block">Issue Resolution Rate</span>
            <span className="text-xl font-black text-emerald-400">{data.kpis.resolution_rate}%</span>
          </div>
        </div>
      )}

      {/* Recharts Analytics Charts */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Submissions Trend */}
          <div className="p-5 rounded-2xl bg-surface border border-surface-border">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Monthly Achievements & Issues Activity</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" stroke="#9CA3AF" fontSize={11} />
                  <YAxis stroke="#9CA3AF" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="submissions" fill="#06B6D4" name="Submissions" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="verified" fill="#10B981" name="Verified" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="issues" fill="#F43F5E" name="Issues" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Issue Categories Breakdown */}
          <div className="p-5 rounded-2xl bg-surface border border-surface-border">
            <h3 className="text-xs font-bold text-gray-300 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <span>Classroom Maintenance Distribution</span>
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.issue_categories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis type="number" stroke="#9CA3AF" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={10} width={130} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '8px' }}
                  />
                  <Bar dataKey="total" fill="#F43F5E" name="Total Reported" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="open" fill="#F59E0B" name="Still Open" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Two Action Queues: Pending Reviews & Urgent Issues */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Achievements Queue */}
        <div className="rounded-2xl bg-surface border border-surface-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Verification Queue ({pendingAchievements.length})
              </h3>
            </div>
            <span className="text-[10px] text-gray-500 font-mono">1-Click Verification</span>
          </div>

          {pendingAchievements.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 bg-surface-elevated/40 rounded-xl border border-dashed border-surface-border">
              All achievement submissions have been reviewed and verified.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-3.5 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-white">{ach.title}</h4>
                    <span className="text-[11px] text-gray-400">
                      {ach.student_name} ({ach.roll_number}) • {ach.event_name}
                    </span>
                    <span className="text-[10px] text-amber-400 font-semibold block mt-0.5">
                      Level: {ach.level_label}
                    </span>
                  </div>

                  <button
                    onClick={() => handleQuickApprove(ach)}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shrink-0 transition"
                  >
                    Verify & Award
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High Priority Maintenance Queue */}
        <div className="rounded-2xl bg-surface border border-surface-border p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Urgent Classroom Hazards ({urgentIssues.length})
              </h3>
            </div>
          </div>

          {urgentIssues.length === 0 ? (
            <div className="py-8 text-center text-xs text-gray-500 bg-surface-elevated/40 rounded-xl border border-dashed border-surface-border">
              No urgent safety hazards reported currently.
            </div>
          ) : (
            <div className="space-y-3">
              {urgentIssues.map((iss) => (
                <div
                  key={iss.id}
                  className="p-3.5 rounded-xl bg-surface-elevated border border-rose-500/30 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-rose-400 px-1.5 py-0.2 rounded bg-rose-500/10">
                        {iss.reference_id}
                      </span>
                      <h4 className="font-bold text-white">{iss.title}</h4>
                    </div>
                    <span className="text-[11px] text-gray-400 block mt-1">
                      {iss.room_details?.room_number || iss.building} • {iss.item_equipment}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 uppercase shrink-0">
                    {iss.status_label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data Engineering & Python ETL Control Panel */}
      <div className="rounded-2xl bg-surface border border-surface-border p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-cyan-400" />
            <div>
              <h3 className="text-sm font-bold text-white">Python Data Engineering ETL Pipeline</h3>
              <p className="text-xs text-gray-400">
                Extracts operational PostgreSQL data, executes schema validation, deduplication, and writes curated analytics models.
              </p>
            </div>
          </div>

          <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> Pipeline Online
          </span>
        </div>

        {etlResult && (
          <div className="p-3.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-xs text-cyan-300">
            <span className="font-bold block">Latest Pipeline Run: {etlResult.job_id}</span>
            <span>
              Extracted {etlResult.records_extracted} records • Validated {etlResult.records_validated} • Loaded {etlResult.records_loaded} into analytics tables!
            </span>
          </div>
        )}

        {/* History Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-elevated text-gray-400 uppercase text-[10px] tracking-wider border-b border-surface-border">
              <tr>
                <th className="py-2.5 px-3">Job ID</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Extracted</th>
                <th className="py-2.5 px-3">Validated</th>
                <th className="py-2.5 px-3">Loaded</th>
                <th className="py-2.5 px-3">Quality Score</th>
                <th className="py-2.5 px-3">Executed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border text-gray-300">
              {etlHistory.slice(0, 5).map((job) => (
                <tr key={job.job_id} className="hover:bg-surface-elevated/70">
                  <td className="py-2.5 px-3 font-mono text-cyan-300 font-bold">{job.job_id}</td>
                  <td className="py-2.5 px-3">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
                      {job.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3">{job.records_extracted}</td>
                  <td className="py-2.5 px-3">{job.records_validated}</td>
                  <td className="py-2.5 px-3 font-semibold text-white">{job.records_loaded}</td>
                  <td className="py-2.5 px-3 font-bold text-amber-400">
                    {job.quality_report?.data_quality_score || 100}%
                  </td>
                  <td className="py-2.5 px-3 text-gray-500 text-[11px]">
                    {new Date(job.started_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
