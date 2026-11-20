import React, { useState, useEffect } from 'react';
import {
  Bell,
  Clock,
  PlusCircle,
  ChevronDown,
  Check,
  UserCheck,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { NotificationItem } from '../../types';

interface TopbarProps {
  onOpenQuickAction: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenQuickAction }) => {
  const { user, demoUsers, switchUser } = useAuth();
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

  return (
    <header className="h-16 bg-surface/90 backdrop-blur-md border-b border-surface-border fixed top-0 right-0 left-64 z-20 px-6 flex items-center justify-between">
      {/* College Time & Campus Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface-elevated/70 border border-surface-border text-xs text-gray-300">
          <Clock className="w-3.5 h-3.5 text-brand-cyan animate-pulse" />
          <span className="font-mono font-semibold text-white">{timeStr || '11:30:00 AM'}</span>
          <span className="text-[10px] text-gray-400 font-medium tracking-wide">IST (Asia/Kolkata)</span>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-gray-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>ECE Department Systems Active</span>
        </div>
      </div>

      {/* Right Controls: Quick Action, Notifications, User Switcher */}
      <div className="flex items-center gap-3">
        {/* Global Quick Action Button */}
        <button
          onClick={onOpenQuickAction}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-teal-600 hover:from-cyan-500 hover:to-teal-500 text-white font-semibold text-xs transition shadow-sm hover:shadow-glow-teal active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Quick Action</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setIsNotifOpen(!isNotifOpen)}
            className="w-9 h-9 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border flex items-center justify-center text-gray-300 hover:text-white transition relative"
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
            <div className="absolute right-0 mt-2 w-80 rounded-xl bg-surface border border-surface-border shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-surface-border flex items-center justify-between bg-surface-elevated">
                <span className="text-xs font-bold text-white uppercase tracking-wider">
                  Notifications ({unreadCount})
                </span>
                {unreadCount > 0 && (
                  <button
                    onClick={handleMarkAllRead}
                    className="text-[11px] text-brand-cyan hover:underline font-medium"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-72 overflow-y-auto divide-y divide-surface-border">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-gray-500">
                    No notifications right now
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 text-xs transition hover:bg-surface-elevated ${
                        !notif.is_read ? 'bg-cyan-500/5' : ''
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold text-white">{notif.title}</span>
                        {!notif.is_read && (
                          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-gray-400 text-[11px] mt-1">{notif.message}</p>
                      <span className="text-[10px] text-gray-500 mt-1 block">
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

        {/* Demo User Switcher Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded-lg bg-surface-elevated hover:bg-surface-hover border border-surface-border text-xs transition"
          >
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <div className="text-left">
              <span className="font-semibold text-white block leading-tight">{user?.full_name}</span>
              <span className="text-[10px] text-gray-400 leading-tight">Switch Persona</span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute right-0 mt-2 w-72 rounded-xl bg-surface border border-surface-border shadow-xl z-50 p-2 overflow-hidden animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-gray-400 border-b border-surface-border mb-1">
                Select Active Persona
              </div>
              <div className="max-h-72 overflow-y-auto space-y-1">
                {demoUsers.map((du) => {
                  const isCurrent = user?.id === du.id;
                  return (
                    <button
                      key={du.id}
                      onClick={() => {
                        switchUser(du.id);
                        setIsUserMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                        isCurrent
                          ? 'bg-cyan-500/15 border border-cyan-500/30 text-white font-semibold'
                          : 'hover:bg-surface-elevated text-gray-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-white">{du.name}</span>
                          <span className="text-[9px] uppercase px-1.5 py-0.2 rounded font-bold bg-surface-elevated text-gray-400">
                            {du.role}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-0.5">{du.details}</p>
                      </div>
                      {isCurrent && <Check className="w-3.5 h-3.5 text-brand-cyan" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
