'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { fetchApi } from './apiClient';

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
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    const res = await fetchApi('/users/profile');
    if (res.success && res.data) {
      setUser(res.data);
    } else {
      setUser(null);
      localStorage.removeItem('accessToken');
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCurrentUser();

    // Listen to localStorage changes across browser tabs/windows
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
    setUser(userData);
    fetchCurrentUser(); // Immediately fetch complete profile with skills
  };

  const logout = async () => {
    await fetchApi('/auth/logout', { method: 'POST' });
    localStorage.removeItem('accessToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser: fetchCurrentUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
