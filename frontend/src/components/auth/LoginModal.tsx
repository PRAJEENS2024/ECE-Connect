import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Lock,
  User as UserIcon,
  Mail,
  KeyRound,
  UserPlus,
  ShieldAlert,
  ArrowRight,
  GraduationCap,
  Briefcase,
  CheckCircle2,
  Building2,
  Eye,
  EyeOff,
  Sparkles,
  Info
} from 'lucide-react';
import { useAuth, RegisterData } from '../../context/AuthContext';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  defaultRole?: string;
  initialTab?: 'login' | 'signup';
}

const SECE_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+ece@sece\.ac\.in$/i;

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultRole,
  initialTab = 'login'
}) => {
  const { login, register, demoUsers } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(initialTab);

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Signup form state
  const [role, setRole] = useState<'STUDENT' | 'FACULTY'>(
    defaultRole === 'FACULTY' || defaultRole === 'HOD' ? 'FACULTY' : 'STUDENT'
  );
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);

  // Student-specific fields
  const [rollNumber, setRollNumber] = useState('');
  const [yearOfStudy, setYearOfStudy] = useState<number>(3);
  const [semester, setSemester] = useState<number>(6);
  const [section, setSection] = useState<string>('A');

  // Faculty-specific fields
  const [facultyId, setFacultyId] = useState('');
  const [designation, setDesignation] = useState('Assistant Professor');
  const [cabinNumber, setCabinNumber] = useState('EC-304');
  const [specialization, setSpecialization] = useState('VLSI Design, Embedded Systems');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDemoDirectory, setShowDemoDirectory] = useState(false);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab, isOpen]);

  if (!isOpen) return null;

  const isEmailValid = email.length > 0 && SECE_EMAIL_REGEX.test(email.trim());

  // Handle Login Submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginIdentifier.trim() || !loginPassword) {
      setError('Please enter both your username/college email and password.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    const res = await login(loginIdentifier.trim(), loginPassword);
    setIsSubmitting(false);

    if (res.success) {
      onClose();
      if (onSuccess) onSuccess();
    } else {
      setError(res.error || 'Authentication failed. Please verify your credentials.');
    }
  };

  // Handle Signup Submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    // Validation
    if (!username.trim()) {
      setError('Please provide a unique username.');
      return;
    }

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please enter your official college email ID.');
      return;
    }

    if (!SECE_EMAIL_REGEX.test(cleanEmail)) {
      setError(
        'Invalid college email! SECE ECE emails must follow the format: [identifier]ece@sece.ac.in (e.g. prajeen.s2024ece@sece.ac.in).'
      );
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters in length.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please re-enter them carefully.');
      return;
    }

    if (role === 'STUDENT' && !rollNumber.trim()) {
      setError('Please enter your student Roll Number (e.g., 24ECE001).');
      return;
    }

    if (role === 'FACULTY' && !facultyId.trim()) {
      setError('Please enter your official Faculty ID (e.g., SECE-ECE-042).');
      return;
    }

    setIsSubmitting(true);

    const payload: RegisterData = {
      username: username.trim().toLowerCase(),
      email: cleanEmail.toLowerCase(),
      password,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      role,
      ...(role === 'STUDENT'
        ? {
            roll_number: rollNumber.trim().toUpperCase(),
            year_of_study: yearOfStudy,
            semester,
            section
          }
        : {
            faculty_id: facultyId.trim().toUpperCase(),
            designation,
            cabin_number: cabinNumber.trim(),
            specialization: specialization.trim()
          })
    };

    const res = await register(payload);
    setIsSubmitting(false);

    if (res.success) {
      setSuccessMessage('Account created successfully! Redirecting...');
      setTimeout(() => {
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    } else {
      setError(res.error || 'Registration failed. Please check your details and try again.');
    }
  };

  // Pre-fill login form from demo accounts
  const handleFillCredentials = (identifier: string, pass: string = 'password123') => {
    setLoginIdentifier(identifier);
    setLoginPassword(pass);
    setError(null);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-10 my-8 max-h-[92vh] flex flex-col"
        >
          {/* Header Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 px-6 py-5 text-white relative shrink-0">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1.5 text-white/80 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              aria-label="Close dialog"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center space-x-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center backdrop-blur-md border border-white/20">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-wider uppercase text-blue-200">
                  Sri Eshwar College of Engineering &bull; ECE Department
                </span>
                <h2 className="text-xl font-extrabold text-white">
                  {activeTab === 'login' ? 'Sign In to ECE Connect' : 'Create Department Account'}
                </h2>
              </div>
            </div>
            <p className="text-xs text-blue-100/90 ml-13">
              Official institutional portal with role-based access for Students, Professors, HOD & Admin.
            </p>
          </div>

          {/* Navigation Tabs: Sign In / Create Account */}
          <div className="flex border-b border-slate-200 bg-slate-50/80 p-1 shrink-0">
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'login'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-blue-600" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab('signup');
                setError(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all flex items-center justify-center space-x-2 ${
                activeTab === 'signup'
                  ? 'bg-white text-blue-700 shadow-sm border border-slate-200/80'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 text-blue-600" />
              <span>Create Account (Sign Up)</span>
            </button>
          </div>

          {/* Body Content */}
          <div className="p-6 overflow-y-auto flex-1">
            {/* Feedback Alerts */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start space-x-2.5"
              >
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
                <span className="leading-relaxed">{error}</span>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center space-x-2.5"
              >
                <CheckCircle2 className="w-4 h-4 flex-shrink-0 text-emerald-600" />
                <span className="font-semibold">{successMessage}</span>
              </motion.div>
            )}

            {/* TAB 1: SIGN IN */}
            {activeTab === 'login' && (
              <div className="space-y-4">
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Username or Email Input */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Username or College Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-4 h-4" />
                      </div>
                      <input
                        type="text"
                        value={loginIdentifier}
                        onChange={(e) => setLoginIdentifier(e.target.value)}
                        placeholder="e.g. prajeen.s2024ece@sece.ac.in or prajeen.s"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                      />
                    </div>
                  </div>

                  {/* Password Input */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-slate-700">
                        Password
                      </label>
                    </div>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-4 h-4" />
                      </div>
                      <input
                        type={showLoginPassword ? 'text' : 'password'}
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        placeholder="Enter your account password"
                        required
                        className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                      />
                      <button
                        type="button"
                        onClick={() => setShowLoginPassword(!showLoginPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Verifying Credentials...</span>
                      </>
                    ) : (
                      <>
                        <span>Sign In Securely</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Helpful Credentials Assistant */}
                <div className="mt-5 pt-4 border-t border-slate-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-bold text-slate-600 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      Quick Fill Sample Accounts
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowDemoDirectory(!showDemoDirectory)}
                      className="text-[11px] text-blue-600 hover:underline font-semibold"
                    >
                      {showDemoDirectory ? 'Hide list' : 'View roster'}
                    </button>
                  </div>

                  {/* Account Roster Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                    {/* Prajeen S - Primary Student */}
                    <button
                      type="button"
                      onClick={() => handleFillCredentials('prajeen.s2024ece@sece.ac.in', 'password123')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Prajeen S</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 text-emerald-800">Student</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">prajeen.s2024ece@sece.ac.in</p>
                      <span className="text-[9px] text-blue-600 font-medium">Click to fill credentials &rarr;</span>
                    </button>

                    {/* HOD Account */}
                    <button
                      type="button"
                      onClick={() => handleFillCredentials('hod.ece@sece.ac.in', 'password123')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-purple-700">Dr. K. Senthil Nathan</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-100 text-purple-800">HOD</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">hod.ece@sece.ac.in</p>
                      <span className="text-[9px] text-purple-600 font-medium">Click to fill credentials &rarr;</span>
                    </button>

                    {/* Professor Account */}
                    <button
                      type="button"
                      onClick={() => handleFillCredentials('anitha.ece@sece.ac.in', 'password123')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700">Dr. R. Anitha</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-800">Professor</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">anitha.ece@sece.ac.in</p>
                      <span className="text-[9px] text-blue-600 font-medium">Click to fill credentials &rarr;</span>
                    </button>

                    {/* Administrator Account */}
                    <button
                      type="button"
                      onClick={() => handleFillCredentials('admin.ece@sece.ac.in', 'password123')}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-amber-400 hover:bg-amber-50/50 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-amber-700">Venkatesh Raman</span>
                        <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-800">Admin</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 truncate">admin.ece@sece.ac.in</p>
                      <span className="text-[9px] text-amber-700 font-medium">Click to fill credentials &rarr;</span>
                    </button>
                  </div>

                  <p className="text-[10px] text-slate-400 text-center mt-3">
                    Default password for all test accounts is <code className="bg-slate-100 text-slate-700 px-1 py-0.5 rounded font-mono font-bold">password123</code>.
                  </p>
                </div>
              </div>
            )}

            {/* TAB 2: SIGN UP / REGISTRATION */}
            {activeTab === 'signup' && (
              <form onSubmit={handleSignupSubmit} className="space-y-4">
                {/* Role Switcher */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Select Your Role in ECE Department
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRole('STUDENT')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                        role === 'STUDENT'
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        role === 'STUDENT' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <GraduationCap className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold">Student</span>
                        <span className="block text-[10px] text-slate-500">Track achievements & timetable</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setRole('FACULTY')}
                      className={`p-3 rounded-xl border text-left transition-all flex items-center space-x-2.5 ${
                        role === 'FACULTY'
                          ? 'border-blue-600 bg-blue-50/60 text-blue-900 shadow-sm'
                          : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        role === 'FACULTY' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold">Professor</span>
                        <span className="block text-[10px] text-slate-500">Manage schedules & queries</span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Name fields */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">First Name</label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="e.g. Prajeen"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Last Name</label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="e.g. S"
                      required
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Username</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <UserIcon className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value.toLowerCase().trim())}
                      placeholder="e.g. prajeen.s"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                    />
                  </div>
                </div>

                {/* College Email with Sri Eshwar ECE format enforcement */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold text-slate-700">
                      SECE College Email ID
                    </label>
                    {isEmailValid && (
                      <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Valid SECE ECE Format
                      </span>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value.toLowerCase().trim())}
                      placeholder="e.g. prajeen.s2024ece@sece.ac.in"
                      required
                      className={`w-full pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 font-mono ${
                        email.length > 0
                          ? isEmailValid
                            ? 'border-emerald-400 focus:ring-emerald-500'
                            : 'border-amber-400 focus:ring-amber-500'
                          : 'border-slate-200 focus:ring-blue-500'
                      }`}
                    />
                  </div>
                  <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                    <Info className="w-3 h-3 text-blue-500 flex-shrink-0" />
                    Format requirement: <code className="text-blue-700 bg-blue-50 px-1 py-0.2 rounded font-bold font-mono">___ece@sece.ac.in</code>
                  </p>
                </div>

                {/* Role Specific Fields */}
                {role === 'STUDENT' ? (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                      Student Academic Details
                    </span>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Roll Number</label>
                      <input
                        type="text"
                        value={rollNumber}
                        onChange={(e) => setRollNumber(e.target.value.toUpperCase().trim())}
                        placeholder="e.g. 24ECE001"
                        required
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Year</label>
                        <select
                          value={yearOfStudy}
                          onChange={(e) => setYearOfStudy(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value={1}>1st Year</option>
                          <option value={2}>2nd Year</option>
                          <option value={3}>3rd Year</option>
                          <option value={4}>4th Year</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Semester</label>
                        <select
                          value={semester}
                          onChange={(e) => setSemester(Number(e.target.value))}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8].map((s) => (
                            <option key={s} value={s}>Sem {s}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold text-slate-700 mb-1">Section</label>
                        <select
                          value={section}
                          onChange={(e) => setSection(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="A">Section A</option>
                          <option value="B">Section B</option>
                          <option value="C">Section C</option>
                        </select>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                    <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                      Faculty Details
                    </span>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Faculty ID</label>
                        <input
                          type="text"
                          value={facultyId}
                          onChange={(e) => setFacultyId(e.target.value.toUpperCase().trim())}
                          placeholder="e.g. SECE-ECE-042"
                          required
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-mono uppercase"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Cabin Number</label>
                        <input
                          type="text"
                          value={cabinNumber}
                          onChange={(e) => setCabinNumber(e.target.value)}
                          placeholder="e.g. EC-304"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Designation</label>
                        <select
                          value={designation}
                          onChange={(e) => setDesignation(e.target.value)}
                          className="w-full px-2 py-1.5 bg-white border border-slate-200 rounded-lg text-xs"
                        >
                          <option value="Assistant Professor">Assistant Professor</option>
                          <option value="Associate Professor">Associate Professor</option>
                          <option value="Professor">Professor</option>
                          <option value="Professor & Senior Mentor">Professor & Senior Mentor</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Specialization</label>
                        <input
                          type="text"
                          value={specialization}
                          onChange={(e) => setSpecialization(e.target.value)}
                          placeholder="e.g. VLSI, Embedded Systems"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min 6 characters"
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        required
                        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showSignupPassword}
                      onChange={(e) => setShowSignupPassword(e.target.checked)}
                      className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Show passwords</span>
                  </label>
                </div>

                {/* Register Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Creating SECE Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Toggle Note */}
            <div className="mt-4 text-center">
              {activeTab === 'login' ? (
                <p className="text-xs text-slate-500">
                  New student or faculty member?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('signup');
                      setError(null);
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Create an account
                  </button>
                </p>
              ) : (
                <p className="text-xs text-slate-500">
                  Already registered with SECE?{' '}
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setError(null);
                    }}
                    className="text-blue-600 font-bold hover:underline"
                  >
                    Sign in to your account
                  </button>
                </p>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
