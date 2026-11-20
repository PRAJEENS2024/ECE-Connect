import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { QuickActionModal } from './components/layout/QuickActionModal';
import { AchievementFormModal } from './components/achievements/AchievementFormModal';
import { IssueFormModal } from './components/issues/IssueFormModal';
import { QueryFormModal } from './components/feedback/QueryFormModal';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { AchievementsPage } from './pages/AchievementsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { IssuesPage } from './pages/IssuesPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { FacultyPage } from './pages/FacultyPage';
import { TimetablePage } from './pages/TimetablePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function AppContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  const handleSelectAction = (actionKey: 'achievement' | 'issue' | 'query') => {
    if (actionKey === 'achievement') setIsAchievementModalOpen(true);
    if (actionKey === 'issue') setIsIssueModalOpen(true);
    if (actionKey === 'query') setIsQueryModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
        <div className="w-12 h-12 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Loading ECE Connect...</p>
      </div>
    );
  }

  // If not logged in, show the attractive Landing Page
  if (!isAuthenticated) {
    return (
      <Routes>
        <Route path="*" element={<LandingPage onEnterApp={() => navigate('/dashboard')} />} />
      </Routes>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex selection:bg-blue-100 selection:text-blue-900">
      {/* Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen bg-slate-50">
        <Topbar onOpenQuickAction={() => setIsQuickActionOpen(true)} />

        <main className="flex-1 mt-16 p-6 max-w-7xl w-full mx-auto">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route
              path="/dashboard"
              element={
                <Dashboard
                  onOpenQuickAction={() => setIsQuickActionOpen(true)}
                  onSelectAction={handleSelectAction}
                />
              }
            />
            <Route
              path="/achievements"
              element={<AchievementsPage onOpenSubmitModal={() => setIsAchievementModalOpen(true)} />}
            />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route
              path="/issues"
              element={<IssuesPage onOpenReportModal={() => setIsIssueModalOpen(true)} />}
            />
            <Route
              path="/feedback"
              element={<FeedbackPage onOpenQueryModal={() => setIsQueryModalOpen(true)} />}
            />
            <Route
              path="/faculty"
              element={<FacultyPage onOpenQueryModal={() => setIsQueryModalOpen(true)} />}
            />
            <Route path="/timetable" element={<TimetablePage />} />
            <Route
              path="/admin"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'HOD', 'PRESIDENT']}>
                  <AdminDashboardPage />
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Quick Action Launcher */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onSelectAction={handleSelectAction}
      />

      {/* Individual Action Form Modals */}
      <AchievementFormModal
        isOpen={isAchievementModalOpen}
        onClose={() => setIsAchievementModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      <IssueFormModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />

      <QueryFormModal
        isOpen={isQueryModalOpen}
        onClose={() => setIsQueryModalOpen(false)}
        onSuccess={() => window.location.reload()}
      />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
