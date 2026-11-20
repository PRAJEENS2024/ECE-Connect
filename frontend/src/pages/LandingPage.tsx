import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Trophy,
  Users,
  Calendar,
  Wrench,
  MessageSquare,
  BarChart3,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  GraduationCap,
  Briefcase,
  ChevronRight,
  CheckCircle2,
  Lock,
  Building2,
  Clock,
  Compass,
  Star,
  Zap,
  Award,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { LoginModal } from '../components/auth/LoginModal';

interface LandingPageProps {
  onEnterApp: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp }) => {
  const { isAuthenticated, user } = useAuth();
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedRoleForLogin, setSelectedRoleForLogin] = useState<string | undefined>(undefined);
  const [initialModalTab, setInitialModalTab] = useState<'login' | 'signup'>('login');

  const handleLaunchRole = (roleName: string) => {
    setSelectedRoleForLogin(roleName);
    setInitialModalTab('login');
    setIsLoginModalOpen(true);
  };

  const handleOpenSignup = (roleName: string = 'STUDENT') => {
    setSelectedRoleForLogin(roleName);
    setInitialModalTab('signup');
    setIsLoginModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* 1. TOP INSTITUTIONAL HEADER */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          {/* Department Branding */}
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-700 to-blue-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-extrabold tracking-tight text-slate-900">ECE Connect</span>
                <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Dept OS
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">
                Department of Electronics & Communication Engineering
              </p>
            </div>
          </div>

          {/* Quick Nav Anchors */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600">
            <a href="#features" className="hover:text-blue-600 transition-colors">Key Modules</a>
            <a href="#roles" className="hover:text-blue-600 transition-colors">Role Architecture</a>
            <a href="#highlights" className="hover:text-blue-600 transition-colors">Student Impact</a>
            <a href="#governance" className="hover:text-blue-600 transition-colors">Accreditation</a>
          </nav>

          {/* Authentication Actions */}
          <div className="flex items-center space-x-3">
            {isAuthenticated && user ? (
              <button
                onClick={onEnterApp}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 transition-all flex items-center space-x-2"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => { setSelectedRoleForLogin(undefined); setInitialModalTab('login'); setIsLoginModalOpen(true); }}
                  className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-slate-300 text-slate-700 hover:text-slate-900 text-xs font-semibold hover:bg-slate-50 transition-all"
                >
                  Sign In
                </button>
                <button
                  onClick={() => { setSelectedRoleForLogin('STUDENT'); setInitialModalTab('signup'); setIsLoginModalOpen(true); }}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center space-x-2"
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Create Account</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-white via-blue-50/30 to-slate-50 border-b border-slate-200">
        <div className="absolute inset-0 bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03]" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Institutional Accreditation Badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 border border-blue-200/80 text-blue-700 text-xs font-semibold mb-6 shadow-sm"
          >
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <span>Sri Eshwar College of Engineering &bull; ECE Department Portal 2026</span>
          </motion.div>

          {/* Main Title */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-[1.15]"
          >
            The Departmental Operating System for{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600">
              Electronics & Communication
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed"
          >
            A unified, role-governed platform connecting students, faculty members, and leadership. Track hackathons, inspect dynamic faculty availability, report classroom maintenance issues, resolve queries, and coordinate conflict-free timetables.
          </motion.p>

          {/* Action CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5"
          >
            <button
              onClick={() => { setSelectedRoleForLogin(undefined); setInitialModalTab('login'); setIsLoginModalOpen(true); }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/35 transition-all flex items-center justify-center space-x-2.5"
            >
              <span>Sign In to Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => { setSelectedRoleForLogin('STUDENT'); setInitialModalTab('signup'); setIsLoginModalOpen(true); }}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-blue-700 text-sm font-bold border border-blue-200 shadow-sm transition-all flex items-center justify-center space-x-2"
            >
              <UserPlus className="w-4 h-4 text-blue-600" />
              <span>Register Account (SECE Email)</span>
            </button>
          </motion.div>

          {/* Key Metrics Strip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-14 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-clean text-center">
              <div className="text-2xl font-extrabold text-blue-600">500+</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Enrolled Students</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-clean text-center">
              <div className="text-2xl font-extrabold text-indigo-600">32</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Faculty & Mentors</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-clean text-center">
              <div className="text-2xl font-extrabold text-amber-500">120+</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Hackathons Won</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-clean text-center">
              <div className="text-2xl font-extrabold text-emerald-600">99.4%</div>
              <div className="text-xs font-semibold text-slate-500 mt-1">Issue Resolution</div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. ROLE-BASED ARCHITECTURE SPOTLIGHT */}
      <section id="roles" className="py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Precision Role Separation</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Designed Specifically for Every Department Member
            </h2>
            <p className="text-sm text-slate-500 mt-3">
              Clear permissions, specialized workflows, and tailored views for students, professors, department leadership, and administrators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* HOD Card */}
            <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200 hover:border-purple-300 hover:bg-white hover:shadow-clean-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">Head of Dept (HOD)</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 text-purple-700">Leadership</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Executive command center, departmental KPIs, final achievement approvals, faculty allocations, and strategic governance.
                </p>
                <ul className="mt-4 space-y-2 text-[11px] text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Executive Analytics Dashboard</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Accreditation & NAAC Reports</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                    <span>Department Announcement Publisher</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleLaunchRole('HOD')}
                className="mt-6 w-full py-2.5 px-3 rounded-xl bg-purple-50 hover:bg-purple-600 text-purple-700 hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-purple-200 hover:border-transparent"
              >
                <span>Launch as HOD</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Professor Card */}
            <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200 hover:border-blue-300 hover:bg-white hover:shadow-clean-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-4">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">Professor / Faculty</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-blue-100 text-blue-700">Academics</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Published timetable schedule, office hours management, student query responder, and laboratory oversight.
                </p>
                <ul className="mt-4 space-y-2 text-[11px] text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Assigned Timetable Slots</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Office Hours & Availability</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                    <span>Student Academic Inquiries</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleLaunchRole('FACULTY')}
                className="mt-6 w-full py-2.5 px-3 rounded-xl bg-blue-50 hover:bg-blue-600 text-blue-700 hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-blue-200 hover:border-transparent"
              >
                <span>Launch as Professor</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Student Card */}
            <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200 hover:border-emerald-300 hover:bg-white hover:shadow-clean-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
                  <Trophy className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">Student Member</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-100 text-emerald-700">Student</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Hackathon submissions, certificate uploads, points ledger, badge unlocks, classroom issue tracking, and faculty finder.
                </p>
                <ul className="mt-4 space-y-2 text-[11px] text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Achievement Ledger & Points</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Classroom Issue Helpdesk</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 flex-shrink-0" />
                    <span>Timetable & Faculty Finder</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleLaunchRole('STUDENT')}
                className="mt-6 w-full py-2.5 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-emerald-200 hover:border-transparent"
              >
                <span>Launch as Student</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Admin Card */}
            <div className="p-6 rounded-2xl bg-slate-50/60 border border-slate-200 hover:border-amber-300 hover:bg-white hover:shadow-clean-md transition-all flex flex-col justify-between group">
              <div>
                <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-base font-bold text-slate-900">Department Admin</h3>
                  <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-amber-100 text-amber-800">Operations</span>
                </div>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Master timetable scheduling, conflict prevention engine, maintenance assignment, user accounts, and ETL analytics pipeline.
                </p>
                <ul className="mt-4 space-y-2 text-[11px] text-slate-600">
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Conflict-Free Scheduling Engine</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Facility Maintenance Workflow</span>
                  </li>
                  <li className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 flex-shrink-0" />
                    <span>Automated ETL Pipeline</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => handleLaunchRole('ADMIN')}
                className="mt-6 w-full py-2.5 px-3 rounded-xl bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white text-xs font-bold transition-all flex items-center justify-center space-x-2 border border-amber-200 hover:border-transparent"
              >
                <span>Launch as Admin</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. KEY MODULES & CAPABILITIES */}
      <section id="features" className="py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600">Core Capabilities</span>
            <h2 className="text-3xl font-extrabold text-slate-900 mt-2">
              Everything Your Department Needs in One Place
            </h2>
            <p className="text-sm text-slate-500 mt-3">
              Eliminate scattered Google Forms, paper logs, and disjointed chat groups with an auditable, institutional operating platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
                <Trophy className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Hackathon & Awards Tracker</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Log competition victories, research paper publications, and certifications. Upload certificates and credit teammates with verified point yields.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Compass className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Smart Faculty Finder</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Find where faculty members are expected to be based on published timetables and declared office hours in Indian Standard Time (`Asia/Kolkata`).
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Wrench className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Classroom Maintenance Helpdesk</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Report broken fans, HDMI projector faults, missing markers, and power issues with unique tracking IDs (`ECE-ISS-2026-XXXX`) and resolution lifecycles.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Calendar className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Conflict-Free Master Timetables</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Coordinate schedules across Years 2, 3, and 4. Automated conflict engine prevents double-booking faculty or laboratory rooms.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <MessageSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Queries & Anonymous Feedback</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Submit academic and lab queries directly to course mentors. Includes optional anonymous routing for candid feedback.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl bg-white border border-slate-200 shadow-clean hover:shadow-clean-md transition-all">
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <BarChart3 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Data Engineering (ETL) Analytics</h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Automated Python ETL pipeline extracting operational tables, cleaning records with Pandas, and producing daily engagement metrics.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRIVACY & ARCHITECTURAL INTEGRITY */}
      <section id="governance" className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-3xl">
              <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs font-semibold mb-4">
                <ShieldCheck className="w-4 h-4 text-blue-300" />
                <span>Ethical & Transparent Engineering</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Built on Relational Integrity & Privacy-First Principles
              </h2>
              <p className="mt-3 text-xs sm:text-sm text-blue-100/90 leading-relaxed">
                Unlike informal systems, ECE Connect guarantees non-negative point ledgers, transactional database constraints in PostgreSQL 18, and algorithmic expected location derived solely from published timetables — without hardware GPS tracking.
              </p>
              <div className="mt-6 flex flex-wrap items-center gap-4 text-xs font-semibold text-blue-200">
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>PostgreSQL 18 Foreign Keys & Check Constraints</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Immutable Points Ledger Invariant</span>
                </span>
                <span className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Asia/Kolkata Timetable Synchronizer</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 6. INSTITUTIONAL FOOTER */}
      <footer className="bg-slate-50 py-12 text-slate-500 text-xs border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-slate-800">ECE Connect Platform</p>
              <p className="text-[11px] text-slate-400">Department of Electronics & Communication Engineering</p>
            </div>
          </div>

          <div className="text-center md:text-right">
            <p>© 2026 Department of ECE. All rights reserved.</p>
            <p className="text-[11px] text-slate-400 mt-1">Autonomous Tier-1 Campus • NAAC A++ Accredited</p>
          </div>
        </div>
      </footer>

      {/* Dedicated Login & Signup Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={onEnterApp}
        defaultRole={selectedRoleForLogin}
        initialTab={initialModalTab}
      />
    </div>
  );
};
