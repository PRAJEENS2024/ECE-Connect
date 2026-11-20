import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { Topbar } from './components/layout/Topbar';
import { QuickActionModal } from './components/layout/QuickActionModal';
import { AchievementFormModal } from './components/achievements/AchievementFormModal';
import { IssueFormModal } from './components/issues/IssueFormModal';
import { QueryFormModal } from './components/feedback/QueryFormModal';

import { Dashboard } from './pages/Dashboard';
import { AchievementsPage } from './pages/AchievementsPage';
import { LeaderboardPage } from './pages/LeaderboardPage';
import { IssuesPage } from './pages/IssuesPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { FacultyPage } from './pages/FacultyPage';
import { TimetablePage } from './pages/TimetablePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';

export function AppContent() {
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isAchievementModalOpen, setIsAchievementModalOpen] = useState(false);
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isQueryModalOpen, setIsQueryModalOpen] = useState(false);

  const handleSelectAction = (actionKey: 'achievement' | 'issue' | 'query') => {
    if (actionKey === 'achievement') setIsAchievementModalOpen(true);
    if (actionKey === 'issue') setIsIssueModalOpen(true);
    if (actionKey === 'query') setIsQueryModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background text-gray-100 flex">
      {/* Collapsible Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 ml-64 flex flex-col min-h-screen">
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
            <Route path="/admin" element={<AdminDashboardPage />} />
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
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}
