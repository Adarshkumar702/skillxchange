'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
} from 'lucide-react';
import { useAuth } from '../lib/authContext';

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = [
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

  if (user?.role === 'ADMIN') {
    links.push({ name: 'Admin Dashboard', href: '/dashboard/admin', icon: ShieldCheck, highlight: false });
  }

  return (
    <aside className="w-64 glass-panel border-r border-surfaceBorder hidden lg:block p-4 space-y-6 flex-shrink-0 min-h-[calc(100vh-73px)]">
      <div className="space-y-1">
        <p className="px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
          Menu Navigation
        </p>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30 shadow-md shadow-indigo-500/10'
                  : 'text-slate-300 hover:bg-surface hover:text-white'
              } ${link.highlight && !isActive ? 'text-cyan-300 bg-cyan-500/10 border border-cyan-500/20' : ''}`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : link.highlight ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
