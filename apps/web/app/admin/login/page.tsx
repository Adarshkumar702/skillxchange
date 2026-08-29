'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../lib/authContext';
import { fetchApi } from '../../../lib/apiClient';
import { ShieldCheck, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      const res = await fetchApi('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: cleanEmail, password: cleanPassword }),
      });

      if (res.success && res.data) {
        setLoading(false);
        if (res.data.user.role !== 'ADMIN') {
          setError('Access Denied: This account does not have Admin privileges.');
          return;
        }
        login(res.data.accessToken, res.data.user);
        router.push('/dashboard/admin');
        return;
      }
    } catch (err) {
      console.log('Backend API login connection fallback triggered');
    }

    // Direct Admin Portal Client Fallback for admin@adarsh.com / 1234 & admin@example.com / admin123
    if (
      (cleanEmail === 'admin@adarsh.com' && cleanPassword === '1234') ||
      (cleanEmail === 'admin@example.com' && cleanPassword === 'admin123')
    ) {
      setLoading(false);
      const adminUserData = {
        id: 'admin-owner-id-001',
        email: cleanEmail,
        role: 'ADMIN',
        isVerified: true,
        profile: {
          fullName: 'Adarsh (Project Owner & Admin)',
          university: 'SkillXchange Administration',
          course: 'Platform Owner & Administrator',
          graduationYear: 2024,
          reputationScore: 5.0,
          completedExchanges: 10,
          location: 'India',
          bio: 'Project Owner and Administrator with full access control to view and remove accounts.',
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminOwner',
        },
        skills: [],
      };
      login('fallback-admin-access-token', adminUserData);
      router.push('/dashboard/admin');
      return;
    }

    setLoading(false);
    setError('Invalid email or password');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-amber-600/15 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-8 rounded-2xl shadow-2xl border border-amber-500/20 space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <ShieldCheck className="w-8 h-8 text-amber-400" />
            <span className="font-black text-2xl text-white tracking-tight">SkillXchange Admin</span>
          </Link>
          <h2 className="text-lg font-bold text-amber-300">Project Owner & Admin Portal</h2>
          <p className="text-xs text-slate-400">Restricted login portal for platform administration and account management.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-amber-400/70 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-surfaceBorder text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="admin@adarsh.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Admin Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-amber-400/70 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-surfaceBorder text-sm text-white focus:outline-none focus:border-amber-400 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-sm shadow-lg transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Authenticating...' : 'Sign In to Admin Portal'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-surfaceBorder text-center">
          <Link href="/login" className="text-xs font-semibold text-slate-400 hover:text-amber-300 transition-colors">
            ← Switch to Student Login
          </Link>
        </div>
      </div>
    </div>
  );
}
