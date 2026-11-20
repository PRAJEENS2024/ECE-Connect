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

  const badgeIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-5 h-5 text-rose-500" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-blue-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'Trophy':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      default:
        return <Award className="w-5 h-5 text-amber-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
            <Award className="w-5 h-5" />
          </div>
          <span>Department Merit & Gamification Hub</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Fair, audited recognition for student technical achievements, hackathons, and departmental leadership.
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex items-center gap-4 border-b border-slate-200">
        <button
          onClick={() => setActiveTab('LEADERBOARD')}
          className={`pb-3.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'LEADERBOARD'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Trophy className="w-4 h-4 text-blue-600" />
          <span>Department Leaderboard</span>
        </button>
        <button
          onClick={() => setActiveTab('BADGES')}
          className={`pb-3.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'BADGES'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Medal className="w-4 h-4 text-purple-600" />
          <span>Honor Badges ({badges.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('LEDGER')}
          className={`pb-3.5 px-3 text-xs font-bold transition-all border-b-2 flex items-center gap-2 ${
            activeTab === 'LEDGER'
              ? 'border-blue-600 text-blue-700'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <FileText className="w-4 h-4 text-emerald-600" />
          <span>Points Audit Ledger</span>
        </button>
      </div>

      {/* TAB 1: LEADERBOARD */}
      {activeTab === 'LEADERBOARD' && (
        <div className="space-y-6">
          {/* Top 3 Podium Display */}
          {top3.length >= 3 && !yearFilter && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              {/* Rank 2 - Silver */}
              <div className="order-2 md:order-1 p-6 rounded-2xl bg-white border border-slate-200 shadow-clean flex flex-col items-center text-center relative overflow-hidden group hover:border-slate-400 transition-all">
                <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-300 text-slate-700 font-extrabold text-xs flex items-center justify-center mb-3 shadow-2xs">
                  2
                </div>
                <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-slate-300 p-1 mb-3 shadow-sm flex items-center justify-center text-slate-800 font-bold text-lg">
                  {top3[1].student_name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-bold text-sm text-slate-900">{top3[1].student_name}</h3>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">{top3[1].roll_number} • Year {top3[1].year_of_study}</span>
                <div className="mt-3 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold">
                  {top3[1].total_points} PTS
                </div>
              </div>

              {/* Rank 1 - Gold (Elevated) */}
              <div className="order-1 md:order-2 p-7 rounded-2xl bg-white border-2 border-amber-300 shadow-clean-md flex flex-col items-center text-center relative overflow-hidden group">
                <div className="w-9 h-9 rounded-full bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center mb-3 shadow-md">
                  👑 1
                </div>
                <div className="w-20 h-20 rounded-full bg-amber-50 border-3 border-amber-400 p-1 mb-3 shadow-sm flex items-center justify-center text-amber-600 font-extrabold text-xl">
                  {top3[0].student_name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-extrabold text-base text-slate-900">{top3[0].student_name}</h3>
                <span className="text-xs text-amber-700 font-mono mt-0.5">{top3[0].roll_number} • Year {top3[0].year_of_study} (Sec {top3[0].section})</span>
                <div className="mt-4 px-4 py-1.5 rounded-full bg-amber-50 border border-amber-300 text-amber-800 text-sm font-black flex items-center gap-1.5 shadow-2xs">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>{top3[0].total_points} PTS</span>
                </div>
              </div>

              {/* Rank 3 - Bronze */}
              <div className="order-3 p-6 rounded-2xl bg-white border border-slate-200 shadow-clean flex flex-col items-center text-center relative overflow-hidden group hover:border-amber-600/40 transition-all">
                <div className="w-8 h-8 rounded-full bg-amber-100 border border-amber-300 text-amber-900 font-extrabold text-xs flex items-center justify-center mb-3 shadow-2xs">
                  3
                </div>
                <div className="w-16 h-16 rounded-full bg-amber-50 border-2 border-amber-300 p-1 mb-3 shadow-sm flex items-center justify-center text-amber-800 font-bold text-lg">
                  {top3[2].student_name.slice(0, 2).toUpperCase()}
                </div>
                <h3 className="font-bold text-sm text-slate-900">{top3[2].student_name}</h3>
                <span className="text-[11px] text-slate-400 font-mono mt-0.5">{top3[2].roll_number} • Year {top3[2].year_of_study}</span>
                <div className="mt-3 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
                  {top3[2].total_points} PTS
                </div>
              </div>
            </div>
          )}

          {/* Filter Bar */}
          <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-clean flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="">All Academic Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>

              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 font-semibold"
              >
                <option value="">All Sections</option>
                <option value="A">Section A</option>
                <option value="B">Section B</option>
              </select>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search student or roll number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Full Leaderboard Table */}
          <div className="rounded-2xl bg-white border border-slate-200 shadow-clean overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                  <tr>
                    <th className="py-3.5 px-5">Rank</th>
                    <th className="py-3.5 px-5">Student</th>
                    <th className="py-3.5 px-5">Roll Number</th>
                    <th className="py-3.5 px-5">Class Section</th>
                    <th className="py-3.5 px-5">Earned Badges</th>
                    <th className="py-3.5 px-5 text-center">Verified Wins</th>
                    <th className="py-3.5 px-5 text-right">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredLeaderboard.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-5 font-bold text-slate-900">
                        <span
                          className={`w-6 h-6 rounded-full inline-flex items-center justify-center text-[11px] ${
                            item.rank === 1
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : item.rank === 2
                              ? 'bg-slate-200 text-slate-800 font-bold'
                              : item.rank === 3
                              ? 'bg-amber-100 text-amber-900 font-bold'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.rank}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-bold text-slate-900">{item.student_name}</td>
                      <td className="py-4 px-5 font-mono text-slate-500">{item.roll_number}</td>
                      <td className="py-4 px-5 text-slate-600">
                        Year {item.year_of_study} (Sec {item.section})
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {item.earned_badges?.map((b) => (
                            <span
                              key={b.id}
                              title={b.badge_description}
                              className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200"
                            >
                              {b.badge_name}
                            </span>
                          ))}
                          {(!item.earned_badges || item.earned_badges.length === 0) && (
                            <span className="text-[11px] text-slate-400">—</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center font-bold text-slate-800">
                        {item.verified_achievements_count}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <span className="font-extrabold text-blue-600 text-sm">{item.total_points}</span>
                        <span className="text-[10px] text-slate-400 ml-1">pts</span>
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
              className="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md hover:border-blue-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                  {badgeIcon(b.icon_name)}
                </div>
                <h3 className="font-bold text-base text-slate-900">{b.name}</h3>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{b.description}</p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Requirement:</span>
                <span className="font-bold text-blue-600">
                  {b.criteria_value}+ {b.criteria_type.replace('_', ' ')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* TAB 3: POINTS AUDIT LEDGER */}
      {activeTab === 'LEDGER' && (
        <div className="rounded-2xl bg-white border border-slate-200 shadow-clean overflow-hidden">
          <div className="p-5 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">Immutable Points Audit Ledger</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparent transaction history recording every verified point award with rule code and timestamp.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider border-b border-slate-200 font-bold">
                <tr>
                  <th className="py-3.5 px-5">Student</th>
                  <th className="py-3.5 px-5">Roll No</th>
                  <th className="py-3.5 px-5">Points</th>
                  <th className="py-3.5 px-5">Reason / Rule Code</th>
                  <th className="py-3.5 px-5">Awarded By</th>
                  <th className="py-3.5 px-5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {ledger.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5 font-bold text-slate-900">{entry.student_name}</td>
                    <td className="py-4 px-5 font-mono text-slate-500">{entry.roll_number}</td>
                    <td className="py-4 px-5 font-extrabold text-blue-600">
                      {entry.points > 0 ? `+${entry.points}` : entry.points} pts
                    </td>
                    <td className="py-4 px-5">
                      <span className="text-slate-900 block font-semibold">{entry.reason}</span>
                      <span className="text-[10px] text-slate-400 font-mono">{entry.rule_code}</span>
                    </td>
                    <td className="py-4 px-5 text-slate-600 font-medium">{entry.awarded_by_name || 'System Auto'}</td>
                    <td className="py-4 px-5 text-slate-400 font-mono text-[11px]">
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
