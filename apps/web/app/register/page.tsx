'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../lib/authContext';
import { fetchApi } from '../../lib/apiClient';
import { Sparkles, ArrowRight, Lock, Mail, User, GraduationCap, BookOpen, AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [university, setUniversity] = useState('Stanford University');
  const [course, setCourse] = useState('Computer Science');
  const [graduationYear, setGraduationYear] = useState(2026);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await fetchApi('/auth/register', {
      method: 'POST',
      body: JSON.stringify({
        fullName,
        email,
        password,
        university,
        course,
        graduationYear: Number(graduationYear),
      }),
    });

    setLoading(false);

    if (res.success && res.data) {
      login(res.data.accessToken, res.data.user);
      router.push('/dashboard/profile');
    } else {
      setError(res.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden bg-background">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-cyan-600/20 blur-[130px] rounded-full pointer-events-none" />

      <div className="max-w-lg w-full glass-panel p-8 rounded-2xl shadow-2xl border border-surfaceBorder space-y-6 relative z-10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-indigo-400" />
            <span className="font-extrabold text-2xl text-white">SkillXchange</span>
          </Link>
          <h2 className="text-lg font-bold text-slate-200">Join SkillXchange Community</h2>
          <p className="text-xs text-slate-400">Connect with student mentors and exchange coding skills.</p>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface border border-surfaceBorder text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Alex Morgan"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">University / College Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface border border-surfaceBorder text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="alex@university.edu"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">University</label>
              <input
                type="text"
                required
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Stanford University"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Course / Major</label>
              <input
                type="text"
                required
                value={course}
                onChange={(e) => setCourse(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="Computer Science"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Graduation Year</label>
              <input
                type="number"
                required
                min={2020}
                max={2035}
                value={graduationYear}
                onChange={(e) => setGraduationYear(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
              <input
                type="password"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-sm text-white focus:outline-none focus:border-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Creating Account...' : 'Create Account'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-surfaceBorder text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="text-indigo-400 font-semibold hover:underline">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
