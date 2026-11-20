import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldAlert, ArrowLeft, RefreshCw, LogIn } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
  onOpenLogin?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  onOpenLogin
}) => {
  const { user, isAuthenticated, isLoading, switchUser, demoUsers } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Verifying Department Credentials...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  // Check role authorization
  if (allowedRoles && allowedRoles.length > 0) {
    const isAllowed = allowedRoles.includes(user.role) || (user.role === 'HOD' && allowedRoles.includes('ADMIN'));
    
    if (!isAllowed) {
      const targetAdmin = demoUsers.find(u => u.role === 'HOD') || demoUsers.find(u => u.role === 'ADMIN');
      return (
        <div className="max-w-xl mx-auto my-12 p-8 bg-white border border-slate-200 rounded-2xl shadow-clean-md text-center">
          <div className="w-14 h-14 mx-auto mb-4 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 border border-amber-200">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            You are signed in as <span className="font-bold text-slate-800">{user.full_name || user.username}</span> ({user.role}).
            This section requires elevated <span className="font-semibold text-blue-600">{allowedRoles.join(' or ')}</span> authorization.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/dashboard"
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center space-x-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to My Dashboard</span>
            </a>
            {targetAdmin && (
              <button
                onClick={() => switchUser(targetAdmin.id)}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-colors flex items-center justify-center space-x-2 shadow-sm"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Switch to HOD / Admin Persona</span>
              </button>
            )}
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
};
