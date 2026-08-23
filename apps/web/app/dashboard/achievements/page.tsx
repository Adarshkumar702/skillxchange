'use client';

import React from 'react';
import { useAuth } from '../../../lib/authContext';
import { Award, Zap, Repeat, Star, CheckCircle, Lock } from 'lucide-react';

export default function AchievementsPage() {
  const { user } = useAuth();
  const unlocked = user?.achievements || [];

  const allBadges = [
    { code: 'FIRST_SKILL', title: 'Skill Pioneer', desc: 'Added your first skill to teach or learn.', icon: Zap, color: 'text-indigo-400 border-indigo-500/20 bg-indigo-500/10' },
    { code: 'FIRST_EXCHANGE', title: 'Skill Swap Initiator', desc: 'Completed your first skill exchange.', icon: Repeat, color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10' },
    { code: 'TOP_TEACHER', title: 'Top-Rated Mentor', desc: 'Maintained 4.8+ rating over 3 exchanges.', icon: Star, color: 'text-amber-400 border-amber-500/20 bg-amber-500/10' },
    { code: 'RELIABLE_PARTNER', title: '100% Completion', desc: 'Completed all scheduled learning sessions.', icon: CheckCircle, color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10' },
  ];

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-2">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-400" /> Gamification Badges & Achievements
        </h1>
        <p className="text-xs text-slate-400">Unlock community reputation badges as you teach, learn, and complete skill exchanges.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {allBadges.map((badge) => {
          const isUnlocked = unlocked.some((u: any) => u.achievement?.code === badge.code || unlocked.some((ua: any) => ua.code === badge.code));
          const Icon = badge.icon;

          return (
            <div
              key={badge.code}
              className={`glass-card p-6 rounded-2xl border space-y-3 relative overflow-hidden transition-all ${
                isUnlocked ? badge.color : 'border-surfaceBorder opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${isUnlocked ? badge.color : 'bg-surface border-surfaceBorder text-slate-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                {isUnlocked ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Unlocked</span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-surface text-slate-500 border border-surfaceBorder flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Locked
                  </span>
                )}
              </div>

              <div>
                <h3 className="text-sm font-bold text-white">{badge.title}</h3>
                <p className="text-xs text-slate-400 mt-1">{badge.desc}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
