import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  User as UserIcon,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  GraduationCap,
  Briefcase,
  KeyRound,
  CheckCircle2,
  Building2
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultRole?: string;
}

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultRole
}) => {
  const { login, loginWithDemo, demoUsers, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState<'demo' | 'credentials'>('demo');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    setError(null);
    setIsSubmitting(true);
    const res = await login(username, password);
    setIsSubmitting(false);
    if (res.success) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Invalid credentials. Please verify your login details.');
    }
  };

  const handleDemoSelect = async (userId: number) => {
    setError(null);
    setIsSubmitting(true);
    await loginWithDemo(userId);
    setIsSubmitting(false);
    onClose();
    if (onSuccess) onSuccess();
  };

  // Find demo users by role
  const hodUser = demoUsers.find(u => u.role === 'HOD') || demoUsers.find(u => u.role === 'ADMIN');
  const professorUser = demoUsers.find(u => u.role === 'FACULTY');
  const studentUser = demoUsers.find(u => u.role === 'STUDENT');
  const adminUser = demoUsers.find(u => u.role === 'ADMIN' && u.id !== hodUser?.id) || demoUsers.find(u => u.role === 'PRESIDENT');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-6 text-white relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xs font-semibold tracking-wider uppercase text-blue-200">Department OS</span>
                <h2 className="text-xl font-bold text-white">Sign In to ECE Connect</h2>
              </div>
            </div>
            <p className="text-xs text-blue-100/90 ml-13">
              Role-governed departmental operations, achievements & academic management platform.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex border-b border-slate-200 bg-slate-50/70 p-1">
            <button
              onClick={() => { setActiveTab('demo'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'demo'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span>1-Click Role Login</span>
            </button>
            <button
              onClick={() => { setActiveTab('credentials'); setError(null); }}
              className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center space-x-1.5 ${
                activeTab === 'credentials'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/60'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Username & Password</span>
            </button>
          </div>

          <div className="p-6">
            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* TAB 1: 1-Click Role Login */}
            {activeTab === 'demo' && (
              <div className="space-y-3">
                <div className="text-xs text-slate-500 font-medium mb-1">
                  Select a role to instantly test permissions and capabilities:
                </div>

                {/* HOD Card */}
                {hodUser && (
                  <button
                    onClick={() => handleDemoSelect(hodUser.id)}
                    disabled={isSubmitting}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-purple-300 hover:bg-purple-50/40 transition-all group flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{hodUser.name}</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-700">
                            HOD
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{hodUser.details || 'Department Leadership & Governance'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                )}

                {/* Professor Card */}
                {professorUser && (
                  <button
                    onClick={() => handleDemoSelect(professorUser.id)}
                    disabled={isSubmitting}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 transition-all group flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{professorUser.name}</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">
                            Professor
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{professorUser.details || 'Faculty Schedule & Query Responder'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                )}

                {/* Student Card */}
                {studentUser && (
                  <button
                    onClick={() => handleDemoSelect(studentUser.id)}
                    disabled={isSubmitting}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 transition-all group flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{studentUser.name}</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">
                            Student
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{studentUser.details || 'Achievements, Issues & Timetables'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                )}

                {/* Admin Card */}
                {adminUser && (
                  <button
                    onClick={() => handleDemoSelect(adminUser.id)}
                    disabled={isSubmitting}
                    className="w-full text-left p-3.5 rounded-xl border border-slate-200 hover:border-amber-300 hover:bg-amber-50/40 transition-all group flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-bold text-slate-900">{adminUser.name}</span>
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">
                            {adminUser.role === 'PRESIDENT' ? 'Student President' : 'Department Admin'}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{adminUser.details || 'Operations & Verification Review'}</p>
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all" />
                  </button>
                )}
              </div>
            )}

            {/* TAB 2: Credentials Form */}
            {activeTab === 'credentials' && (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Username or Roll / Employee ID
                  </label>
                  <div className="relative">
                    <UserIcon className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. hod, dr.anitha, priya.ece22, admin"
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-900 transition-all"
                      required
                    />
                  </div>
                  <div className="mt-1.5 text-[11px] text-slate-400">
                    Demo passwords: <span className="text-slate-600 font-mono">hod123</span>, <span className="text-slate-600 font-mono">faculty123</span>, <span className="text-slate-600 font-mono">student123</span>, <span className="text-slate-600 font-mono">admin123</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center justify-center space-x-2"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Sign In with Credentials</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Footer note */}
          <div className="px-6 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Role-Based Access Control Active</span>
            </span>
            <span className="font-mono text-slate-400">ECE Connect v2.0</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
