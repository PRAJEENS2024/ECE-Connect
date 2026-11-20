import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Clock,
  PlusCircle,
  ChevronDown,
  Check,
  UserCheck,
  Sparkles,
  LogOut,
  ExternalLink,
  Shield,
  GraduationCap,
  Briefcase,
  User as UserIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { NotificationItem } from '../../types';

interface TopbarProps {
  onOpenQuickAction: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenQuickAction }) => {
  const { user, demoUsers, switchUser, logout, roleLabel } = useAuth();
  const navigate = useNavigate();
  const [timeStr, setTimeStr] = useState<string>('');
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Update IST clock every second
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = {
        timeZone: 'Asia/Kolkata',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      };
      setTimeStr(new Intl.DateTimeFormat('en-IN', options).format(now));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch notifications
  const loadNotifications = async () => {
    try {
      const data = await api.notifications.list();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error loading notifications:', err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [user]);

  const unreadCount = Array.isArray(notifications)
    ? notifications.filter((n) => !n.is_read).length
    : 0;

  const handleMarkAllRead = async () => {
    try {
      await api.notifications.markAllRead();
      setNotifications(notifications.map((n) => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'HOD':
        return <Briefcase className="w-3.5 h-3.5 text-purple-600" />;
      case 'FACULTY':
        return <GraduationCap className="w-3.5 h-3.5 text-blue-600" />;
      case 'STUDENT':
        return <UserIcon className="w-3.5 h-3.5 text-emerald-600" />;
      case 'ADMIN':
        return <Shield className="w-3.5 h-3.5 text-amber-600" />;
      default:
        return <UserCheck className="w-3.5 h-3.5 text-blue-600" />;
    }
  };

  return (
    <header className="h-16 bg-white/90 backdrop-blur-md border-b border-slate-200 fixed top-0 right-0 left-64 z-20 px-6 flex items-center justify-between shadow-clean">
      {/* College Time & Campus Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700">
          <Clock className="w-3.5 h-3.5 text-blue-600 animate-pulse" />
          <span className="font-mono font-bold text-slate-900">{timeStr || '11:30:00 AM'}</span>
          <span className="text-[10px] text-slate-500 font-medium">IST (Asia/Kolkata)</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span className="font-medium text-slate-600">ECE Systems Operational</span>
        </div>
      </div>

      {/* Right Controls: Quick Action, Notifications, User Switcher, Logout */}
      <div className="flex items-center gap-3">
        {/* Global Quick Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-all shadow-md shadow-blue-500/20 hover:shadow-lg active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Quick Action</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors relative"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                {unreadCount}
              </span>
            )}
          </button>

          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between bg-slate-50/80">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-blue-600 hover:underline font-semibold"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-slate-100">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400">
                    No new notifications right now
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3.5 text-xs transition hover:bg-slate-50 ${
                        !notif.is_read ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-bold text-slate-800">{notif.title}</span>
                        {!notif.is_read && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-slate-600 text-[11px] mt-1 leading-relaxed">{notif.message}</p>
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        {new Date(notif.created_at).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active User Account & Profile Details */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs transition-colors"
          >
            {getRoleIcon(user?.role || 'STUDENT')}
            <div className="text-left">
              <span className="font-bold text-slate-900 block leading-tight">{user?.full_name || user?.username}</span>
              <span className="text-[10px] text-blue-600 font-semibold leading-tight">{roleLabel}</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white border border-slate-200 shadow-2xl z-50 p-4 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-700 font-bold text-sm">
                  {user?.first_name ? user.first_name[0] : (user?.username ? user.username[0].toUpperCase() : 'U')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs truncate">{user?.full_name || user?.username}</span>
                    <span className={`text-[9px] uppercase px-1.5 py-0.5 rounded font-extrabold ${
                      user?.role === 'HOD' ? 'bg-purple-100 text-purple-700' :
                      user?.role === 'FACULTY' ? 'bg-blue-100 text-blue-700' :
                      user?.role === 'STUDENT' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {user?.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono truncate">{user?.email || '___ece@sece.ac.in'}</p>
                </div>
              </div>

              <div className="py-2.5 space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Department</span>
                  <span className="font-medium text-slate-800">ECE</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-slate-400">Security Clearance</span>
                  <span className="font-bold text-blue-600 font-mono">{user?.role}</span>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100">
                <button
                  onClick={() => {
                    setIsUserMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full py-2 px-3 rounded-xl bg-slate-50 hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out of Account</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Proper Logout Button */}
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-rose-200 bg-white hover:bg-rose-50 text-slate-600 hover:text-rose-600 text-xs font-semibold transition-all shadow-sm"
          title="Sign Out of Portal"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};
