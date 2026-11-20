import React, { useState, useEffect } from 'react';
import {
  Award,
  Trophy,
  Medal,
  Sparkles,
  Flame,
  ShieldCheck,
  Cpu,
  FileText,
  Search,
  Filter,
} from 'lucide-react';
import { api } from '../api/client';
import { LeaderboardEntry, Badge, PointLedgerEntry } from '../types';

export const LeaderboardPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'LEADERBOARD' | 'BADGES' | 'LEDGER'>('LEADERBOARD');
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [ledger, setLedger] = useState<PointLedgerEntry[]>([]);
  const [scopeFilter, setScopeFilter] = useState<string>('overall');
  const [yearFilter, setYearFilter] = useState<string>('');
  const [sectionFilter, setSectionFilter] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = [];
      if (yearFilter) params.push(`year=${yearFilter}`);
      if (sectionFilter) params.push(`section=${sectionFilter}`);

      const [lbRes, bgRes, ldRes] = await Promise.all([
        api.gamification.getLeaderboard(params.join('&')),
        api.gamification.getBadges(),
        api.gamification.getLedger(),
      ]);

      setLeaderboard(lbRes.leaderboard || []);
      setBadges(bgRes);
      setLedger(ldRes);
    } catch (err) {
      console.error('Error loading gamification data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [yearFilter, sectionFilter]);

  const filteredLeaderboard = leaderboard.filter((item) => {
    if (!search) return true;
    const term = search.toLowerCase();
    return (
      item.student_name.toLowerCase().includes(term) ||
      item.roll_number.toLowerCase().includes(term)
    );
  });

  const top3 = filteredLeaderboard.slice(0, 3);
  const remaining = filteredLeaderboard.slice(3);

  const badgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-400" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-cyan-400" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-amber-400" />;
      default:
        return <Award className="w-5 h-5 text-amber-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Award className="w-6 h-6 text-amber-400" />
          <span>Department Merit & Gamification Hub</span>
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">
          Fair, verified recognition for student technical achievements, hackathons, and community contributions.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-border">
        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'LEADERBOARD'
              ? 'border-cyan-400 text-brand-cyan'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Trophy className="w-4 h-4" />
          <span>Department Leaderboard</span>
        </button>
        <button
          onClick={() => setActiveTab('BADGES')}
          className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'BADGES'
              ? 'border-cyan-400 text-brand-cyan'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <Medal className="w-4 h-4" />
          <span>Badges & Honors ({badges.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`pb-3 px-3 text-xs font-bold transition border-b-2 flex items-center gap-2 ${
            activeTab === 'LEDGER'
              ? 'border-cyan-400 text-brand-cyan'
              : 'border-transparent text-gray-400 hover:text-white'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Points Audit Ledger</span>
        </button>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'LEADERBOARD' && (
        <div className="space-y-6">
          {/* Top 3 Podium Display */}
          {top3.length >= 3 && !yearFilter && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              {/* Rank 2 - Silver */}
              <div className="order-2 md:order-1 p-5 rounded-2xl bg-surface border border-surface-border flex flex-col items-center text-center relative overflow-hidden group hover:border-slate-400/40 transition">
                <div className="w-8 h-8 rounded-full bg-slate-300 text-gray-900 font-black text-xs flex items-center justify-center mb-3 shadow-md">
                  2
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 p-0.5 mb-3 shadow-lg">
                  <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-white font-bold text-lg">
                    {top3[1].student_name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <h3 className="font-bold text-sm text-white">{top3[1].student_name}</h3>
                <span className="text-[11px] text-gray-400 font-mono">{top3[1].roll_number} • Year {top3[1].year_of_study}</span>
                <div className="mt-3 px-3 py-1 rounded-full bg-slate-400/10 border border-slate-400/30 text-slate-300 text-xs font-black">
                  {top3[1].total_points} PTS
                </div>
              </div>

              {/* Rank 1 - Gold (Elevated) */}
              <div className="order-1 md:order-2 p-6 rounded-2xl bg-gradient-to-b from-amber-500/10 via-surface to-surface border border-amber-500/30 flex flex-col items-center text-center relative overflow-hidden shadow-glow-amber group">
                <div className="w-9 h-9 rounded-full bg-amber-400 text-gray-950 font-black text-xs flex items-center justify-center mb-3 shadow-lg">
                  👑 1
                </div>
                <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 mb-3 shadow-xl">
                  <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-amber-300 font-extrabold text-xl">
                    {top3[0].student_name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <h3 className="font-extrabold text-base text-white">{top3[0].student_name}</h3>
                <span className="text-xs text-amber-300 font-mono">{top3[0].roll_number} • Year {top3[0].year_of_study} (Sec {top3[0].section})</span>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 text-sm font-black flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" />
                  <span>{top3[0].total_points} PTS</span>
                </div>
              </div>

              {/* Rank 3 - Bronze */}
              <div className="order-3 p-5 rounded-2xl bg-surface border border-surface-border flex flex-col items-center text-center relative overflow-hidden group hover:border-amber-700/40 transition">
                <div className="w-8 h-8 rounded-full bg-amber-700 text-white font-black text-xs flex items-center justify-center mb-3 shadow-md">
                  3
                </div>
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-700 to-amber-600 p-0.5 mb-3 shadow-lg">
                  <div className="w-full h-full rounded-full bg-surface flex items-center justify-center text-white font-bold text-lg">
                    {top3[2].student_name.slice(0, 2).toUpperCase()}
                  </div>
                </div>
                <h3 className="font-bold text-sm text-white">{top3[2].student_name}</h3>
                <span className="text-[11px] text-gray-400 font-mono">{top3[2].roll_number} • Year {top3[2].year_of_study}</span>
                <div className="mt-3 px-3 py-1 rounded-full bg-amber-700/20 border border-amber-700/30 text-amber-300 text-xs font-black">
                  {top3[2].total_points} PTS
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="p-4 rounded-xl bg-surface border border-surface-border flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>

              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-surface-elevated border border-surface-border text-white text-xs focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* Full Leaderboard Table */}
          <div className="rounded-xl bg-surface border border-surface-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-surface-elevated text-gray-400 uppercase text-[10px] tracking-wider border-b border-surface-border">
                  <tr>
                    <th className="py-3 px-4">Rank</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Roll Number</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Badges Earned</th>
                    <th className="py-3 px-4 text-center">Verified Submissions</th>
                    <th className="py-3 px-4 text-right">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border text-gray-300">
                  {filteredLeaderboard.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-elevated/70 transition">
                      <td className="py-3.5 px-4 font-bold text-white">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] ${
                            item.rank === 1
                              ? 'bg-amber-400 text-gray-950 font-black'
                              : item.rank === 2
                              ? 'bg-slate-300 text-gray-950 font-bold'
                              : item.rank === 3
                              ? 'bg-amber-700 text-white font-bold'
                              : 'bg-surface-elevated text-gray-400'
                          }`}
                        >
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-white">{item.student_name}</td>
                      <td className="py-3.5 px-4 font-mono text-gray-400">{item.roll_number}</td>
                      <td className="py-3.5 px-4 text-gray-400">
                        Year {item.year_of_study} (Sec {item.section})
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.earned_badges?.map((b) => (
                            <span
                              key={b.id}
                              title={b.badge_description}
                              className="px-2 py-0.5 rounded text-[10px] font-bold bg-surface-elevated text-cyan-300 border border-surface-border"
                            >
                              {b.badge_name}
                            </span>
                          ))}
                          {(!item.earned_badges || item.earned_badges.length === 0) && (
                            <span className="text-[11px] text-gray-500">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-gray-300">
                        {item.verified_achievements_count}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="font-black text-amber-400 text-sm">{item.total_points}</span>
                        <span className="text-[10px] text-gray-500 ml-1">pts</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BADGES & HONORS SHOWCASE */}
      {activeTab === 'BADGES' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {badges.map((b) => (
            <div
              key={b.id}
              className="p-5 rounded-xl bg-surface border border-surface-border hover:border-cyan-500/30 transition flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-surface-elevated border border-surface-border flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  {badgeIcon(b.icon_name)}
                </div>
                <h3 className="font-bold text-base text-white">{b.name}</h3>
                <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">{b.description}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-xs">
                <span className="text-gray-500">Requirement:</span>
                <span className="font-bold text-cyan-400">
                  {b.criteria_value}+ {b.criteria_type.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: POINTS AUDIT LEDGER */}
      {activeTab === 'LEDGER' && (
        <div className="rounded-xl bg-surface border border-surface-border overflow-hidden">
          <div className="p-4 border-b border-surface-border">
            <h3 className="text-sm font-bold text-white">Immutable Points Audit Ledger</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Transparent transaction history recording every verified point award with rule code and timestamp.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-elevated text-gray-400 uppercase text-[10px] tracking-wider border-b border-surface-border">
                <tr>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Roll No</th>
                  <th className="py-3 px-4">Points</th>
                  <th className="py-3 px-4">Reason / Rule Code</th>
                  <th className="py-3 px-4">Awarded By</th>
                  <th className="py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border text-gray-300">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-elevated/70 transition">
                    <td className="py-3.5 px-4 font-semibold text-white">{entry.student_name}</td>
                    <td className="py-3.5 px-4 font-mono text-gray-400">{entry.roll_number}</td>
                    <td className="py-3.5 px-4 font-bold text-amber-400">
                      {entry.points > 0 ? `+${entry.points}` : entry.points} pts
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-white block font-medium">{entry.reason}</span>
                      <span className="text-[10px] text-gray-500 font-mono">{entry.rule_code}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">{entry.awarded_by_name || 'System Auto'}</td>
                    <td className="py-3.5 px-4 text-gray-500 font-mono text-[11px]">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
