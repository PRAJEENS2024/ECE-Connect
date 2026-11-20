import React, { createContext, useContext, useState, useEffect } from 'react';
import { api, setActiveUserId, getActiveUserId } from '../api/client';
import { User, StudentProfile, FacultyProfile } from '../types';

interface DemoUser {
  id: number;
  username: string;
  name: string;
  role: string;
  role_label: string;
  details: string;
}

interface AuthContextType {
  user: User | null;
  profile: StudentProfile | FacultyProfile | null;
  isLoading: boolean;
  demoUsers: DemoUser[];
  activeUserId: string | null;
  switchUser: (userId: number) => Promise<void>;
  refreshUser: () => Promise<void>;
  isStudent: boolean;
  isFaculty: boolean;
  isPresident: boolean;
  isAdmin: boolean;
  isAdminOrPresident: boolean;
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
      // If no active user set, select the first student (Priya)
      if (!getActiveUserId() && users.length > 0) {
        const studentUser = users.find((u: any) => u.role === 'STUDENT') || users[0];
        setActiveUserId(studentUser.id);
        setUserIdState(String(studentUser.id));
      }
    } catch (err) {
      console.error('Error fetching demo users:', err);
    }
  };

  const loadCurrentUser = async () => {
    try {
      setIsLoading(true);
      const res = await api.auth.me();
      if (res && res.user) {
        setUser(res.user);
        setProfile(res.profile);
      }
    } catch (err) {
      console.error('Error loading current user:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDemoUsers().then(() => {
      loadCurrentUser();
    });
  }, []);

  const switchUser = async (newUserId: number) => {
    setActiveUserId(newUserId);
    setUserIdState(String(newUserId));
    await loadCurrentUser();
  };

  const refreshUser = async () => {
    await loadCurrentUser();
  };

  const isStudent = user?.role === 'STUDENT';
  const isFaculty = user?.role === 'FACULTY';
  const isPresident = user?.role === 'PRESIDENT';
  const isAdmin = user?.role === 'ADMIN';
  const isAdminOrPresident = isPresident || isAdmin;

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        demoUsers,
        activeUserId,
        switchUser,
        refreshUser,
        isStudent,
        isFaculty,
        isPresident,
        isAdmin,
        isAdminOrPresident,
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
