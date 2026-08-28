'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../lib/apiClient';
import { useAuth } from '../../lib/authContext';
import {
  Compass,
  Repeat,
  Calendar,
  Target,
  Sparkles,
  ArrowRight,
  Star,
  Clock,
  BookOpen,
  Award,
  Plus,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  // Fetch Recommended Matches
  const { data: matchesRes } = useQuery({
    queryKey: ['recommendedMatches'],
    queryFn: () => fetchApi('/matches/recommended'),
  });

  // Fetch Active Swaps
  const { data: swapsRes } = useQuery({
    queryKey: ['activeSwaps'],
    queryFn: () => fetchApi('/swaps?status=ACCEPTED'),
  });

  // Fetch Upcoming Sessions
  const { data: sessionsRes } = useQuery({
    queryKey: ['upcomingSessions'],
    queryFn: () => fetchApi('/sessions'),
  });

  // Fetch Placement Readiness
  const { data: placementRes } = useQuery({
    queryKey: ['placementReadiness'],
    queryFn: () => fetchApi('/placement/readiness'),
  });

  const matches = matchesRes?.data || [];
  const activeSwaps = swapsRes?.data || [];
  const sessions = sessionsRes?.data || [];
  const placement = placementRes?.data;

  const userSkills = user?.skills || [];
  const teachingSkills = userSkills.filter((s: any) => s.type === 'TEACHING');
  const learningSkills = userSkills.filter((s: any) => s.type === 'LEARNING');

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-300 dark:border-surfaceBorder flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Welcome Back
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white">
            Hello, {user?.profile?.fullName || 'Developer'}! 👋
          </h1>
          <p className="text-xs font-medium text-slate-600 dark:text-slate-400">
            {user?.profile?.university} • {user?.profile?.course} ({user?.profile?.graduationYear})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/discover" className="btn-primary text-xs font-semibold flex items-center gap-1.5">
            <Compass className="w-4 h-4" /> Find Matches
          </Link>
          <Link href="/dashboard/profile" className="px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs font-semibold text-textMain hover:border-slate-400 transition-colors shadow-sm">
            Manage Skills
          </Link>
        </div>
      </div>

      {/* My Active Skills Overview Card */}
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surfaceBorder pb-3">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-500" /> My Skills Overview
            </h2>
            <p className="text-xs text-textMuted">Your active teaching & learning skills used for AI reciprocal matching.</p>
          </div>

          <Link
            href="/dashboard/profile"
            className="text-xs font-bold text-blue-600 dark:text-indigo-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <Plus className="w-3.5 h-3.5" /> Edit Skills in Profile
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-1">
          {/* Teaching Skills */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-surfaceBorder space-y-2">
            <span className="text-xs font-extrabold text-textMuted uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-4 h-4 text-blue-500" /> Skills I Can Teach ({teachingSkills.length})
            </span>
            {teachingSkills.length === 0 ? (
              <p className="text-xs text-textMuted pt-1">No teaching skills added yet. Add skills to start mentoring peers!</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {teachingSkills.map((s: any) => (
                  <span
                    key={s.id || s.skillId}
                    className="px-3 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white text-xs font-bold border border-slate-300 dark:border-slate-700 shadow-sm"
                  >
                    {s.skill?.name || s.name}{' '}
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 opacity-80 uppercase">({s.proficiency})</span>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Learning Skills */}
          <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900/80 border border-surfaceBorder space-y-2">
            <span className="text-xs font-extrabold text-textMuted uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-4 h-4 text-amber-500" /> Skills I Want to Learn ({learningSkills.length})
            </span>
            {learningSkills.length === 0 ? (
              <p className="text-xs text-textMuted pt-1">No learning skills added yet. Add skills to find compatible mentors!</p>
            ) : (
              <div className="flex flex-wrap gap-2 pt-1">
                {learningSkills.map((s: any) => (
                  <span
                    key={s.id || s.skillId}
                    className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-bold shadow-sm"
                  >
                    {s.skill?.name || s.name}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Row - All Cards Are Interactive Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          href="/dashboard/ratings"
          className="glass-card p-4 rounded-xl space-y-1 hover:border-amber-500/40 transition-all cursor-pointer block group"
        >
          <div className="flex justify-between items-center text-textMuted text-xs font-semibold group-hover:text-amber-400">
            <span>Reputation Score</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{user?.profile?.reputationScore || 5.0} / 5.0</p>
          <p className="text-[11px] font-medium text-textMuted">{user?.profile?.completedExchanges || 0} completed swaps</p>
        </Link>

        <Link
          href="/dashboard/placement"
          className="glass-card p-4 rounded-xl space-y-1 hover:border-blue-500/40 transition-all cursor-pointer block group"
        >
          <div className="flex justify-between items-center text-textMuted text-xs font-semibold group-hover:text-blue-400">
            <span>Placement Readiness</span>
            <Target className="w-4 h-4 text-blue-500" />
          </div>
          <p className="text-2xl font-extrabold text-blue-600 dark:text-cyan-300">{placement?.overallScore || 75}%</p>
          <p className="text-[11px] font-medium text-textMuted">{placement?.careerRole?.title || 'Full Stack Developer'}</p>
        </Link>

        <Link
          href="/dashboard/swaps"
          className="glass-card p-4 rounded-xl space-y-1 hover:border-indigo-500/40 transition-all cursor-pointer block group"
        >
          <div className="flex justify-between items-center text-textMuted text-xs font-semibold group-hover:text-indigo-400">
            <span>Active Exchanges</span>
            <Repeat className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-300">{activeSwaps.length}</p>
          <p className="text-[11px] font-medium text-textMuted">In-progress learning →</p>
        </Link>

        <Link
          href="/dashboard/sessions"
          className="glass-card p-4 rounded-xl space-y-1 hover:border-emerald-500/40 transition-all cursor-pointer block group"
        >
          <div className="flex justify-between items-center text-textMuted text-xs font-semibold group-hover:text-emerald-400">
            <span>Upcoming Sessions</span>
            <Calendar className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-300">{sessions.length}</p>
          <p className="text-[11px] font-medium text-textMuted">Scheduled 1-on-1 calls →</p>
        </Link>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Top Match Suggestions & Active Exchanges */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top AI Skill Matches */}
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-blue-500" /> Top Compatible Skill Matches
                </h2>
                <p className="text-xs font-medium text-textMuted">AI-computed compatibility based on reciprocal skills & university.</p>
              </div>
              <Link href="/dashboard/discover" className="text-xs text-blue-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {matches.slice(0, 4).map((match: any) => (
                <div key={match.user.id} className="glass-card p-4 rounded-xl space-y-3 relative">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={match.user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                        alt="Avatar"
                        className="w-8 h-8 rounded-full border border-slate-400"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{match.user.fullName}</p>
                        <p className="text-[11px] font-medium text-textMuted truncate max-w-[120px]">{match.user.university}</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
                      {match.compatibilityScore}% Match
                    </span>
                  </div>

                  <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2">
                    💡 {match.explanations[0] || 'Compatible skill background.'}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-surfaceBorder">
                    <span className="text-[11px] font-bold text-amber-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> {match.user.reputationScore}
                    </span>
                    <Link
                      href={`/dashboard/discover`}
                      className="text-xs font-bold text-blue-600 dark:text-indigo-400 hover:underline"
                    >
                      Connect & Swap →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Active Exchanges */}
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Repeat className="w-5 h-5 text-blue-500" /> Active Skill Exchanges
              </h2>
              <Link href="/dashboard/swaps" className="text-xs text-blue-600 dark:text-indigo-400 font-bold hover:underline">
                Manage Swaps
              </Link>
            </div>

            {activeSwaps.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-slate-300 dark:border-surfaceBorder rounded-xl space-y-2">
                <p className="text-xs font-medium text-textMuted">No active exchanges in progress.</p>
                <Link href="/dashboard/discover" className="btn-primary inline-block text-xs">
                  Discover Peers to Swap
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {activeSwaps.map((swap: any) => (
                  <div key={swap.id} className="glass-card p-4 rounded-xl flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          Teach {swap.offeredSkill.name} ↔ Learn {swap.requestedSkill.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-indigo-400 border border-blue-500/20">
                          {swap.learningProgress?.percentage || 0}% Progress
                        </span>
                      </div>
                      <p className="text-xs font-medium text-textMuted">
                        Partner: {swap.sender.profile?.fullName === user?.profile?.fullName ? swap.receiver.profile?.fullName : swap.sender.profile?.fullName}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/chat?conversationId=${swap.conversation?.id}`}
                      className="px-3 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-xs font-semibold text-textMain hover:border-slate-400 shadow-sm"
                    >
                      Open Chat
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: AI Assistant Quick Action & Upcoming Sessions */}
        <div className="space-y-6">
          {/* AI Career Assistant Prompt */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-300 dark:border-surfaceBorder space-y-4 shadow-sm">
            <div className="flex items-center gap-2 text-blue-600 dark:text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-slate-900 dark:text-white text-sm">AI Career Assistant</h3>
            </div>
            <p className="text-xs font-medium text-slate-700 dark:text-slate-300 leading-relaxed">
              Ask AI about personalized skill roadmaps, placement preparation strategies, or missing backend/frontend competencies!
            </p>
            <Link
              href="/dashboard/ai-assistant"
              className="w-full btn-primary py-2 text-xs font-semibold flex items-center justify-center gap-2"
            >
              Ask AI Career Assistant <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Upcoming Sessions */}
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-500" /> Upcoming Sessions
              </h3>
              <Link href="/dashboard/sessions" className="text-xs text-blue-600 dark:text-indigo-400 font-bold hover:underline">
                Schedule
              </Link>
            </div>

            {sessions.length === 0 ? (
              <p className="text-xs font-medium text-textMuted text-center py-4">No scheduled learning sessions.</p>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 3).map((sess: any) => (
                  <div key={sess.id} className="p-3 rounded-lg bg-surface border border-surfaceBorder space-y-1">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{sess.title}</p>
                    <p className="text-[11px] font-medium text-textMuted">
                      {new Date(sess.scheduledAt).toLocaleString()} ({sess.durationMinutes} mins)
                    </p>
                    {sess.meetingUrl && (
                      <a
                        href={sess.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-blue-600 dark:text-cyan-400 font-bold hover:underline block pt-1"
                      >
                        Join Video Call →
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
