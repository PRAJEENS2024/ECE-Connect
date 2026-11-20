import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Award,
  AlertTriangle,
  MessageSquare,
  Users,
  Calendar,
  Shield,
  Zap,
  Sparkles,
  LogOut,
  ChevronRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, profile, isAdminOrHOD, isAdminOrPresident, logout, roleLabel } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/achievements', label: 'Achievements', icon: Trophy, badge: 'Hackathons' },
    { to: '/leaderboard', label: 'Leaderboard', icon: Award },
    { to: '/issues', label: 'Classroom Issues', icon: AlertTriangle },
    { to: '/feedback', label: 'Feedback & Queries', icon: MessageSquare },
    { to: '/faculty', label: 'Faculty Finder', icon: Users, badge: 'Live' },
    { to: '/timetable', label: 'Class Timetable', icon: Calendar },
  ];

  if (isAdminOrPresident || isAdminOrHOD) {
    navItems.push({
      to: '/admin',
      label: 'Command Center',
      icon: Shield,
      badge: user?.role === 'HOD' ? 'HOD' : 'Admin',
    });
  }

  const roleStyle = {
    HOD: 'bg-purple-50 text-purple-700 border-purple-200',
    FACULTY: 'bg-blue-50 text-blue-700 border-blue-200',
    STUDENT: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    ADMIN: 'bg-amber-50 text-amber-800 border-amber-200',
    PRESIDENT: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  }[user?.role || 'STUDENT'];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-screen fixed left-0 top-0 z-30 select-none shadow-clean">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200 bg-white">
        <NavLink to="/dashboard" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900">ECE Connect</span>
              <span className="text-[10px] uppercase font-bold px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                v2.0
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-medium">Electronics & Comm.</p>
          </div>
        </NavLink>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold tracking-wider uppercase text-slate-400">
          Department Modules
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-200/80 font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-slate-400 group-hover:text-blue-600" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    item.badge === 'Admin' || item.badge === 'HOD'
                      ? 'bg-purple-100 text-purple-700 border border-purple-200'
                      : item.badge === 'Live'
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Info Card in Footer with Proper Logout */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <div className="p-3 rounded-xl bg-white border border-slate-200 shadow-sm flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
              {user?.first_name ? user.first_name[0] : 'U'}
              {user?.last_name ? user.last_name[0] : ''}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 truncate">{user?.full_name || user?.username}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${roleStyle}`}>
                  {user?.role}
                </span>
                {'total_points' in (profile || {}) && (
                  <span className="text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                    <Sparkles className="w-2.5 h-2.5" /> {(profile as any).total_points}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Sign Out Action */}
          <button
            onClick={handleLogout}
            title="Sign Out of Portal"
            className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
