import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Trophy,
  Award,
  AlertTriangle,
  MessageSquare,
  Users,
  Calendar,
  Shield,
  Cpu,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar: React.FC = () => {
  const { user, profile, isAdminOrPresident } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/achievements', label: 'Achievements', icon: Trophy, badge: 'Hackathons' },
    { to: '/leaderboard', label: 'Leaderboard', icon: Award },
    { to: '/issues', label: 'Classroom Issues', icon: AlertTriangle },
    { to: '/feedback', label: 'Feedback & Queries', icon: MessageSquare },
    { to: '/faculty', label: 'Faculty Finder', icon: Users, badge: 'Live' },
    { to: '/timetable', label: 'Class Timetable', icon: Calendar },
  ];

  if (isAdminOrPresident) {
    navItems.push({
      to: '/admin',
      label: 'Operations & Analytics',
      icon: Shield,
      badge: 'Admin',
    });
  }

  const roleBadgeColor = {
    STUDENT: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    FACULTY: 'bg-violet-500/10 text-violet-400 border-violet-500/20',
    PRESIDENT: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    ADMIN: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  }[user?.role || 'STUDENT'];

  return (
    <aside className="w-64 bg-surface border-r border-surface-border flex flex-col h-screen fixed left-0 top-0 z-30 select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 flex items-center gap-3 border-b border-surface-border">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-teal-400 flex items-center justify-center text-background font-black shadow-glow-teal">
          <Cpu className="w-5 h-5 text-gray-950" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-base tracking-tight text-white">ECE Connect</span>
            <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-brand-cyan/20 text-brand-cyan">v2.6</span>
          </div>
          <p className="text-[11px] text-gray-400 font-medium">Electronics & Comm. Engg.</p>
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-gray-500">
          Main Navigation
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-brand-cyan border border-cyan-500/30 shadow-sm'
                    : 'text-gray-300 hover:text-white hover:bg-surface-hover'
                }`
              }
            >
              <div className="flex items-center gap-3">
                <Icon className="w-4 h-4 text-gray-400 group-hover:text-cyan-400" />
                <span>{item.label}</span>
              </div>
              {item.badge && (
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                    item.badge === 'Admin'
                      ? 'bg-amber-500/20 text-amber-300'
                      : 'bg-surface-elevated text-gray-400'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* User Info Card in Footer */}
      <div className="p-3 border-t border-surface-border bg-surface/50">
        <div className="p-3 rounded-xl bg-surface-elevated/70 border border-surface-border flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-cyan-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
            {user?.first_name ? user.first_name[0] : 'U'}
            {user?.last_name ? user.last_name[0] : ''}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-white truncate">{user?.full_name}</p>
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded border ${roleBadgeColor}`}>
                {user?.role}
              </span>
              {'total_points' in (profile || {}) && (
                <span className="text-[10px] text-amber-400 font-semibold flex items-center gap-0.5">
                  <Sparkles className="w-2.5 h-2.5" /> {(profile as any).total_points} pts
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
