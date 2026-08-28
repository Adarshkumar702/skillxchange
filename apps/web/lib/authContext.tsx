'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from './apiClient';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

interface User {
  id: string;
  email: string;
  role: string;
  profile: {
    fullName: string;
    avatarUrl?: string;
    university: string;
    course: string;
    graduationYear: number;
    reputationScore: number;
    completedExchanges: number;
    bio?: string;
    location?: string;
    githubUrl?: string;
    linkedinUrl?: string;
  };
  skills?: any[];
  achievements?: any[];
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  login: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('accessToken');
    const loginTime = localStorage.getItem('loginTimestamp');

    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    // Check 7-day default login window
    if (loginTime) {
      const elapsed = Date.now() - parseInt(loginTime, 10);
      if (elapsed > SEVEN_DAYS_MS) {
        console.log('7-day login period expired. Please log in again.');
        localStorage.removeItem('accessToken');
        localStorage.removeItem('loginTimestamp');
        setUser(null);
        setLoading(false);
        return;
      }
    }

    const res = await fetchApi('/users/profile');
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      setUser(null);
      localStorage.removeItem('accessToken');
      localStorage.removeItem('loginTimestamp');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCurrentUser();

    // Listen to localStorage changes across browser tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'accessToken') {
        fetchCurrentUser();
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (accessToken: string, userData: User) => {
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('loginTimestamp', Date.now().toString());
    setUser(userData); // Instant local state update without redundant second HTTP fetch
    setLoading(false);
  };

  const logout = async () => {
    await fetchApi('/auth/logout', { method: 'POST' });
    localStorage.removeItem('accessToken');
    localStorage.removeItem('loginTimestamp');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
