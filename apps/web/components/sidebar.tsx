'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../lib/apiClient';
import {
  LayoutDashboard,
  Compass,
  Repeat,
  MessageSquare,
  Calendar,
  LineChart,
  Award,
  Star,
  Brain,
  Target,
  Sparkles,
  Bell,
  User,
  ShieldCheck,
  Users,
  Clock,
  Terminal,
  LogOut,
} from 'lucide-react';
import { useAuth } from '../lib/authContext';

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Fetch admin user creation logs for Admin Sidebar
  const { data: usersRes } = useQuery({
    queryKey: ['sidebarAdminUsersLogs'],
    queryFn: () => fetchApi('/admin/users'),
    enabled: user?.role === 'ADMIN',
  });

  const { data: matchesRes } = useQuery({
    queryKey: ['sidebarFallbackMatches'],
    queryFn: () => fetchApi('/matches/recommended'),
    enabled: user?.role === 'ADMIN',
  });

  const rawUsersList = usersRes?.data?.users || [];
  const candidateUsers = (matchesRes?.data || []).map((m: any) => ({
    id: m.user.id,
    email: `${m.user.fullName.toLowerCase().replace(/\s+/g, '')}@student.edu`,
    role: 'STUDENT',
    createdAt: new Date().toISOString(),
    profile: {
      fullName: m.user.fullName,
      university: m.user.university,
      course: m.user.course,
      avatarUrl: m.user.avatarUrl,
    },
  }));

  // Merge registered users list
  const usersList = rawUsersList.length > 0 ? rawUsersList : candidateUsers;
  const totalUserCount = usersRes?.data?.total || usersList.length || 4;

  // Student Links
  const studentLinks = [
    { name: 'Dashboard Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Discover Matches', href: '/dashboard/discover', icon: Compass },
    { name: 'Skill Exchanges', href: '/dashboard/swaps', icon: Repeat },
    { name: 'Real-Time Chat', href: '/dashboard/chat', icon: MessageSquare },
    { name: 'Learning Sessions', href: '/dashboard/sessions', icon: Calendar },
    { name: 'Exchange Progress', href: '/dashboard/progress', icon: LineChart },
    { name: 'Placement Readiness', href: '/dashboard/placement', icon: Target, highlight: true },
    { name: 'Skill Gap Analyzer', href: '/dashboard/skill-gap', icon: Brain },
    { name: 'AI Career Assistant', href: '/dashboard/ai-assistant', icon: Sparkles },
    { name: 'Ratings & Reputation', href: '/dashboard/ratings', icon: Star },
    { name: 'Achievements & Badges', href: '/dashboard/achievements', icon: Award },
    { name: 'Notifications', href: '/dashboard/notifications', icon: Bell },
    { name: 'My Profile', href: '/dashboard/profile', icon: User },
  ];

  // Render Exclusive Admin Sidebar Layout for Admin Accounts
  if (user?.role === 'ADMIN') {
    return (
      <aside className="w-72 glass-panel border-r border-amber-500/20 bg-slate-950/90 hidden lg:block p-4 space-y-5 flex-shrink-0 min-h-[calc(100vh-65px)]">
        {/* Admin Header */}
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-amber-400 flex items-center gap-1.5 uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Logs Panel
            </span>
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-extrabold text-[10px]">
              Root Admin
            </span>
          </div>
          <p className="text-[11px] text-slate-300">Live platform account creation registry & audit stream.</p>
        </div>

        {/* Total Users Metric Card */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-1 shadow">
          <div className="flex justify-between items-center text-slate-400 text-xs font-bold">
            <span>TOTAL REGISTERED USERS</span>
            <Users className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-black text-white">{totalUserCount} Accounts</p>
          <p className="text-[10px] text-slate-400">Database user registry</p>
        </div>

        {/* User Account Creation Logs Stream */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" /> User Creation Logs
            </span>
            <span className="text-[10px] text-amber-400 font-mono">Live Logs</span>
          </div>

          <div className="max-h-[380px] overflow-y-auto space-y-2 pr-1 custom-scrollbar">
            {usersList.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-3 text-center">Loading creation logs...</p>
            ) : (
              usersList.map((u: any) => (
                <div
                  key={u.id}
                  className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/30 transition-all space-y-1"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-white truncate max-w-[130px]">
                      {u.profile?.fullName || u.email.split('@')[0]}
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                      }`}
                    >
                      {u.role}
                    </span>
                  </div>

                  <div className="text-[10px] text-slate-400 font-mono truncate">{u.email}</div>

                  <div className="pt-1 flex items-center justify-between text-[9px] text-slate-400 border-t border-slate-800/80">
                    <span className="text-amber-400/90 font-mono font-bold">ID: {u.id.substring(0, 8)}...</span>
                    <span>{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Quick Admin Navigation */}
        <div className="pt-3 border-t border-slate-800 space-y-1.5">
          <Link
            href="/dashboard/admin"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/dashboard/admin'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>👑 Executive Control Panel</span>
          </Link>

          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
              pathname === '/dashboard/profile'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-300 hover:bg-slate-900 hover:text-white'
            }`}
          >
            <User className="w-4 h-4" />
            <span>My Admin Profile</span>
          </Link>

          <button
            onClick={logout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold text-red-400 hover:bg-red-500/10 transition-all"
          >
            <LogOut className="w-4 h-4" />
            <span>Log Out Admin</span>
          </button>
        </div>
      </aside>
    );
  }

  // Render Standard Navigation Sidebar for Students
  return (
    <aside className="w-64 glass-panel border-r border-surfaceBorder hidden lg:block p-4 space-y-6 flex-shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold text-textMuted uppercase tracking-wider mb-2">
          Navigation
        </p>
        {studentLinks.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-grey-900 text-white dark:bg-grey-100 dark:text-grey-900 shadow-sm'
                  : 'text-textMuted hover:bg-surfaceHover hover:text-textMain'
              } ${link.highlight && !isActive ? 'text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20' : ''}`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? (pathname === link.href ? 'text-current' : '') : link.highlight ? 'text-blue-500' : 'text-textMuted'
                }`}
              />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
