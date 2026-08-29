'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/authContext';
import { ThemeToggle } from './theme-toggle';
import { Sparkles, ArrowRight, Bell, ShieldCheck, ArrowLeft } from 'lucide-react';

export function Navbar() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Show Back Button on all pages except the Home / Landing page ("/")
  const showBackButton = pathname !== '/';

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-surfaceBorder px-6 py-3.5 shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        {/* Left Section: Back Button + Brand Logo */}
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface border border-surfaceBorder text-xs font-bold text-textMuted hover:text-textMain hover:border-slate-400 transition-all shadow-sm active:scale-95"
              title="Go Back"
            >
              <ArrowLeft className="w-4 h-4 text-slate-900 dark:text-white" />
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center shadow-md transition-transform group-hover:scale-105">
              <Sparkles className="w-4 h-4 text-white dark:text-slate-950" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-textMain">
                SkillXchange
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-grey-200 dark:bg-grey-800 text-grey-700 dark:text-grey-300 border border-surfaceBorder">
                Pro SaaS
              </span>
            </div>
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-6 text-xs font-semibold text-textMuted">
          <Link href="/dashboard/discover" className="hover:text-textMain transition-colors">
            Discover
          </Link>
          <Link href="/dashboard/placement" className="hover:text-textMain transition-colors flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Placement Readiness
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
                  className="hidden sm:flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Admin
                </Link>
              )}
              <Link href="/dashboard/notifications" className="p-2 rounded-lg bg-surface border border-surfaceBorder text-textMuted hover:text-textMain transition-colors shadow-sm">
                <Bell className="w-4 h-4" />
              </Link>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-xs font-semibold text-textMain hover:border-grey-400 shadow-sm transition-all"
              >
                <img
                  src={user.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                  alt="Avatar"
                  className="w-5 h-5 rounded-full border border-grey-400"
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
              <Link href="/register" className="px-4 py-2 rounded-xl bg-slate-950 dark:bg-white text-white dark:text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md hover:bg-slate-800 dark:hover:bg-slate-100">
                Get Started <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
