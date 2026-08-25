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
    <aside className="w-64 glass-panel border-r border-surfaceBorder hidden lg:block p-4 space-y-6 flex-shrink-0 min-h-[calc(100vh-65px)]">
      <div className="space-y-1">
        <p className="px-3 text-[10px] font-bold text-textMuted uppercase tracking-wider mb-2">
          Navigation
        </p>
        {links.map((link) => {
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
              <Icon className={`w-4 h-4 ${isActive ? (pathname === link.href ? 'text-current' : '') : link.highlight ? 'text-blue-500' : 'text-textMuted'}`} />
              <span>{link.name}</span>
            </Link>
          );
        })}
      </div>
    </aside>
  );
}
