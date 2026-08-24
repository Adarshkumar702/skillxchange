'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../lib/authContext';
import { ThemeToggle } from './theme-toggle';
import { Sparkles, ArrowRight, Bell, ShieldCheck } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-surfaceBorder px-6 py-3.5">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-100 flex items-center justify-center transition-transform group-hover:scale-105">
            <Sparkles className="w-4 h-4 text-slate-100 dark:text-slate-900" />
          </div>
          <div>
            <span className="font-extrabold text-lg tracking-tight text-textMain">
              SkillXchange
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              Slate Edition
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-textMuted">
          <Link href="/dashboard/discover" className="hover:text-textMain transition-colors">
            Discover
          </Link>
          <Link href="/dashboard/placement" className="hover:text-textMain transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-blue-500" /> Placement Readiness
          </Link>
          <Link href="/dashboard/skill-gap" className="hover:text-textMain transition-colors">
            Skill Gap Analyzer
          </Link>
          <Link href="/dashboard/ai-assistant" className="hover:text-textMain transition-colors">
            AI Assistant
          </Link>
        </div>

        {/* Right Section: Theme Toggle & User Auth */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {user ? (
            <div className="flex items-center gap-3">
              {user.role === 'ADMIN' && (
                <Link
                  href="/dashboard/admin"
                  className="hidden sm:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              <Link href="/dashboard/notifications" className="p-2 rounded-lg bg-surface border border-surfaceBorder text-textMuted hover:text-textMain transition-colors">
                <Bell className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-xs font-semibold text-textMain hover:border-slate-400 transition-all"
              >
                <img
                  src={user.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                  alt="Avatar"
                  className="w-5 h-5 rounded-full border border-slate-400"
                />
                <span className="max-w-[110px] truncate">{user.profile?.fullName || 'Dashboard'}</span>
              </Link>
              <button
                onClick={logout}
                className="text-xs text-textMuted hover:text-red-500 transition-colors px-1 py-1"
              >
                Logout
              </button>
            </div>
          ) : (
            <>
              <Link href="/login" className="text-xs font-semibold text-textMuted hover:text-textMain transition-colors">
                Sign In
              </Link>
              <Link href="/register" className="btn-primary text-xs flex items-center gap-1.5">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
