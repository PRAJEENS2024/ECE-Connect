import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setActiveUserId, getActiveUserId, clearActiveUserId } from '../api/client';
import { User, StudentProfile, FacultyProfile } from '../types';

export interface DemoUser {
  id: number;
  username: string;
  email?: string;
  name: string;
  role: string;
  role_label: string;
  details: string;
  identifier?: string;
  suggested_password?: string;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  role: 'STUDENT' | 'FACULTY';
  roll_number?: string;
  year_of_study?: number;
  semester?: number;
  section?: string;
  faculty_id?: string;
  designation?: string;
  cabin_number?: string;
  specialization?: string;
}

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | FacultyProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  demoUsers: DemoUser[];
  activeUserId: string | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  loginWithDemo: (userId: number) => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (userId: number) => Promise<void>;
  refreshUser: () => Promise<void>;
  isStudent: boolean;
  isFaculty: boolean;
  isProfessor: boolean;
  isHOD: boolean;
  isPresident: boolean;
  isAdmin: boolean;
  isAdminOrHOD: boolean;
  isAdminOrPresident: boolean;
  roleLabel: string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<StudentProfile | FacultyProfile | null>(null);
  const [demoUsers, setDemoUsers] = useState<DemoUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeUserId, setUserIdState] = useState<string | null>(getActiveUserId());

  const fetchDemoUsers = async () => {
    try {
      const users = await api.auth.demoUsers();
      setDemoUsers(users);
    } catch (err) {
      console.error('Error fetching demo users:', err);
    }
  };

  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      const res = await api.auth.me();
      if (res && res.authenticated && res.user) {
        setUser(res.user);
        setProfile(res.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch (err) {
      console.error('Error loading current user:', err);
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoUsers().then(() => {
      loadCurrentUser();
    });
  }, []);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await api.auth.login({ username, password });
      if (res && res.token) {
        setActiveUserId(res.token);
        setUserIdState(res.token);
        setUser(res.user);
        setProfile(res.profile);
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Invalid username or password' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      const res = await api.auth.register(data);
      if (res && res.token) {
        setActiveUserId(res.token);
        setUserIdState(res.token);
        setUser(res.user);
        setProfile(res.profile);
        return { success: true };
      }
      return { success: false, error: 'Registration failed.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Registration failed.' };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemo = async (userId: number) => {
    const target = demoUsers.find(u => u.id === userId);
    if (target) {
      await login(target.username, 'password123');
    }
  };

  const switchUser = async (newUserId: number) => {
    await loginWithDemo(newUserId);
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      clearActiveUserId();
      setUserIdState(null);
      setUser(null);
      setProfile(null);
    }
  };

  const refreshUser = async () => {
    await loadCurrentUser();
  };

  const isHOD = user?.role === 'HOD';
  const isProfessor = user?.role === 'FACULTY' || isHOD;
  const isFaculty = user?.role === 'FACULTY' || isHOD;
  const isStudent = user?.role === 'STUDENT';
  const isPresident = user?.role === 'PRESIDENT';
  const isAdmin = user?.role === 'ADMIN' || isHOD;
  const isAdminOrHOD = isHOD || user?.role === 'ADMIN';
  const isAdminOrPresident = isHOD || user?.role === 'ADMIN' || user?.role === 'PRESIDENT';

  let roleLabel = 'Guest';
  if (isHOD) roleLabel = 'Head of Department (HOD)';
  else if (user?.role === 'FACULTY') roleLabel = 'Professor';
  else if (isStudent) roleLabel = 'Student';
  else if (user?.role === 'ADMIN') roleLabel = 'Department Admin';
  else if (isPresident) roleLabel = 'Student President';

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        demoUsers,
        activeUserId,
        login,
        register,
        loginWithDemo,
        logout,
        switchUser,
        refreshUser,
        isStudent,
        isFaculty,
        isProfessor,
        isHOD,
        isPresident,
        isAdmin,
        isAdminOrHOD,
        isAdminOrPresident,
        roleLabel,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
