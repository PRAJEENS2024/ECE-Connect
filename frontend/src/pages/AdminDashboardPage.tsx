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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center border border-purple-200">
              <Shield className="w-5 h-5" />
            </div>
            <span>Department Operations & Analytics Command Center</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time management console for HOD, Department Administrators, and Student Council.
          </p>
        </div>

        <button
          onClick={handleRunETL}
          disabled={runningETL}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center gap-2 shrink-0 self-start"
        >
          <RotateCw className={`w-4 h-4 ${runningETL ? 'animate-spin' : ''}`} />
          <span>{runningETL ? 'Executing Pipeline...' : 'Run Python ETL Pipeline'}</span>
        </button>
      </div>

      {/* KPI Cards */}
      {data && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Students</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{data.kpis.total_students}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Faculty</span>
            <span className="text-2xl font-extrabold text-slate-900 mt-1 block">{data.kpis.total_faculty}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Verified Wins</span>
            <span className="text-2xl font-extrabold text-blue-600 mt-1 block">{data.kpis.verified_achievements}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Pending Reviews</span>
            <span className="text-2xl font-extrabold text-amber-500 mt-1 block">{data.kpis.pending_achievements}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Open Tickets</span>
            <span className="text-2xl font-extrabold text-rose-600 mt-1 block">{data.kpis.open_issues}</span>
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean">
            <span className="text-[11px] font-bold text-slate-400 block uppercase tracking-wider">Resolution Rate</span>
            <span className="text-2xl font-extrabold text-emerald-600 mt-1 block">{data.kpis.resolution_rate}%</span>
          </div>
        </div>
      )}

      {/* Recharts Analytics Charts */}
      {data && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Monthly Submissions Trend */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-blue-600" />
              <span>Monthly Achievements & Issues Activity</span>
            </h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthly_trend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis dataKey="month" stroke="#64748B" fontSize={11} />
                  <YAxis stroke="#64748B" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="submissions" fill="#2563EB" name="Submissions" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="verified" fill="#10B981" name="Verified" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="issues" fill="#EF4444" name="Issues" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Issue Categories Breakdown */}
          <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <span>Classroom Maintenance Distribution</span>
            </h3>
            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.issue_categories} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                  <XAxis type="number" stroke="#64748B" fontSize={11} />
                  <YAxis dataKey="name" type="category" stroke="#64748B" fontSize={10} width={130} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#FFFFFF',
                      borderColor: '#E2E8F0',
                      borderRadius: '12px',
                      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="total" fill="#EF4444" name="Total Reported" radius={[0, 4, 4, 0]} />
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
        <div className="rounded-2xl bg-white border border-slate-200 shadow-clean p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Verification Queue ({pendingAchievements.length})
              </h3>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">1-Click Verification</span>
          </div>

          {pendingAchievements.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
              All achievement submissions have been reviewed and verified.
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAchievements.map((ach) => (
                <div
                  key={ach.id}
                  className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <h4 className="font-bold text-slate-900">{ach.title}</h4>
                    <span className="text-[11px] text-slate-500">
                      {ach.student_name} ({ach.roll_number}) • {ach.event_name}
                    </span>
                    <span className="text-[10px] text-amber-700 font-bold block mt-0.5">
                      Level: {ach.level_label}
                    </span>
                  </div>

                  <button
                    onClick={() => handleQuickApprove(ach)}
                    className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shrink-0 transition-all shadow-sm"
                  >
                    Verify & Award
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* High Priority Maintenance Queue */}
        <div className="rounded-2xl bg-white border border-slate-200 shadow-clean p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-500" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Urgent Classroom Hazards ({urgentIssues.length})
              </h3>
            </div>
          </div>

          {urgentIssues.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-500 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
              No urgent safety hazards reported currently.
            </div>
          ) : (
            <div className="space-y-3">
              {urgentIssues.map((iss) => (
                <div
                  key={iss.id}
                  className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 flex items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[10px] font-bold text-rose-700 px-2 py-0.5 rounded bg-white border border-rose-200">
                        {iss.reference_id}
                      </span>
                      <h4 className="font-bold text-slate-900">{iss.title}</h4>
                    </div>
                    <span className="text-[11px] text-slate-600 block mt-1">
                      {iss.room_details?.room_number || iss.building} • {iss.item_equipment}
                    </span>
                  </div>

                  <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 border border-rose-200 uppercase shrink-0">
                    {iss.status_label}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Data Engineering & Python ETL Control Panel */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-clean p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-200">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Python Data Engineering ETL Pipeline</h3>
              <p className="text-xs text-slate-500">
                Extracts operational PostgreSQL data, executes schema validation, deduplication, and writes curated analytics models.
              </p>
            </div>
          </div>

          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Pipeline Ready
          </span>
        </div>

        {etlResult && (
          <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-xs text-blue-800 leading-relaxed">
            <span className="font-bold block mb-0.5">Latest Pipeline Run: {etlResult.job_id}</span>
            <span>
              Extracted {etlResult.records_extracted} records • Validated {etlResult.records_validated} • Loaded {etlResult.records_loaded} into analytics tables!
            </span>
          </div>
        )}

        {/* History Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
              <tr>
                <th className="py-3 px-4">Job ID</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Extracted</th>
                <th className="py-3 px-4">Validated</th>
                <th className="py-3 px-4">Loaded</th>
                <th className="py-3 px-4">Quality Score</th>
                <th className="py-3 px-4">Executed At</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {etlHistory.slice(0, 5).map((job) => (
                <tr key={job.job_id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono text-blue-700 font-bold">{job.job_id}</td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold">
                      {job.status}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold">{job.records_extracted}</td>
                  <td className="py-3 px-4 font-semibold">{job.records_validated}</td>
                  <td className="py-3 px-4 font-bold text-slate-900">{job.records_loaded}</td>
                  <td className="py-3 px-4 font-bold text-amber-600">
                    {job.quality_report?.data_quality_score || 100}%
                  </td>
                  <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
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
