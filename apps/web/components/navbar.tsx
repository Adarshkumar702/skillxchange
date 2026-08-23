'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { Sparkles, ArrowRight, UserCheck, Bell, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-surfaceBorder px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-background rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400" />
            </div>
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
              SkillXchange
            </span>
            <span className="hidden sm:inline-block ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              SaaS Edition
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
          <Link href="/dashboard/discover" className="hover:text-indigo-400 transition-colors">
            Discover
          </Link>
          <Link href="/dashboard/placement" className="hover:text-indigo-400 transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Placement Readiness
          </Link>
          <Link href="/dashboard/skill-gap" className="hover:text-indigo-400 transition-colors">
            Skill Gap Analyzer
          </Link>
          <Link href="/dashboard/ai-assistant" className="hover:text-indigo-400 transition-colors">
            AI Assistant
          </Link>
        </div>

        {/* Auth Buttons */}
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/admin"
                  className="hidden sm:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-md bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              <Link href="/dashboard/notifications" className="p-2 rounded-lg bg-surface hover:bg-surfaceBorder text-slate-300 transition-colors">
                <Bell className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-sm font-medium text-white hover:border-indigo-500/40 transition-all"
              >
                <img
                  src={user.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                  alt="Avatar"
                  className="w-6 h-6 rounded-full border border-indigo-400"
                />
                <span className="max-w-[120px] truncate">{user.profile?.fullName || 'Dashboard'}</span>
              </Link>
              <button
                onClick={logout}
                className="text-xs text-slate-400 hover:text-red-400 transition-colors px-2 py-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-sm flex items-center gap-1.5">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
