'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { fetchApi } from '../../lib/apiClient';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('student@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetchApi('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    setLoading(false);

    if (res.success && res.data) {
      login(res.data.accessToken, res.data.user);
      router.push('/dashboard');
    } else {
      setError(res.message || 'Invalid email or password');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-md w-full glass-panel p-8 rounded-2xl shadow-2xl border border-surfaceBorder space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span className="font-extrabold text-2xl text-white">SkillXchange</span>
          </Link>
          <h2 className="text-lg font-bold text-slate-200">Sign in to your account</h2>
          <p className="text-xs text-slate-400">Enter your credentials to manage skills and swap requests.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-surfaceBorder text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="student@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-surface border border-surfaceBorder text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-surfaceBorder text-center space-y-2 text-xs">
          <p className="text-slate-400">
            Don’t have an account?{' '}
            <Link href="/register" className="text-indigo-400 font-semibold hover:underline">
              Create Account
            </Link>
          </p>
          <div className="p-2 rounded bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300 text-left">
            <strong>Demo Credentials:</strong><br />
            Student: <code>student@example.com</code> / <code>password123</code><br />
            Admin: <code>admin@example.com</code> / <code>admin123</code>
          </div>
        </div>
      </div>
    </div>
  );
}
