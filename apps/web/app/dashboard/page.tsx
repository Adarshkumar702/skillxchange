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
  CheckCircle,
  Clock,
  BookOpen,
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

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-surface to-background flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" /> Welcome Back
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Hello, {user?.profile?.fullName || 'Developer'}! 👋
          </h1>
          <p className="text-xs text-slate-400">
            {user?.profile?.university} • {user?.profile?.course} ({user?.profile?.graduationYear})
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/dashboard/discover" className="btn-primary text-xs font-semibold flex items-center gap-1.5">
            <Compass className="w-4 h-4" /> Find Matches
          </Link>
          <Link href="/dashboard/profile" className="px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-slate-300 hover:text-white transition-colors">
            Manage Skills
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Reputation Score</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-2xl font-bold text-white">{user?.profile?.reputationScore || 5.0} / 5.0</p>
          <p className="text-[11px] text-slate-400">{user?.profile?.completedExchanges || 0} completed swaps</p>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Placement Readiness</span>
            <Target className="w-4 h-4 text-cyan-400" />
          </div>
          <p className="text-2xl font-bold text-cyan-300">{placement?.overallScore || 75}%</p>
          <p className="text-[11px] text-slate-400">{placement?.careerRole?.title || 'Full Stack Developer'}</p>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Active Exchanges</span>
            <Repeat className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-2xl font-bold text-indigo-300">{activeSwaps.length}</p>
          <p className="text-[11px] text-slate-400">In-progress learning</p>
        </div>

        <div className="glass-card p-4 rounded-xl space-y-1">
          <div className="flex justify-between items-center text-slate-400 text-xs">
            <span>Upcoming Sessions</span>
            <Calendar className="w-4 h-4 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold text-emerald-300">{sessions.length}</p>
          <p className="text-[11px] text-slate-400">Scheduled 1-on-1 calls</p>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Top Match Suggestions & Active Exchanges */}
        <div className="lg:col-span-2 space-y-6">
          {/* Top AI Skill Matches */}
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Compass className="w-5 h-5 text-indigo-400" /> Top Compatible Skill Matches
                </h2>
                <p className="text-xs text-slate-400">AI-computed compatibility based on reciprocal skills & university.</p>
              </div>
              <Link href="/dashboard/discover" className="text-xs text-indigo-400 font-semibold hover:underline flex items-center gap-1">
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
                        className="w-8 h-8 rounded-full border border-indigo-400"
                      />
                      <div>
                        <p className="text-xs font-bold text-white">{match.user.fullName}</p>
                        <p className="text-[11px] text-slate-400 truncate max-w-[120px]">{match.user.university}</p>
                      </div>
                    </div>
                    <span className="text-xs font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      {match.compatibilityScore}% Match
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 line-clamp-2">
                    💡 {match.explanations[0] || 'Compatible skill background.'}
                  </p>

                  <div className="flex justify-between items-center pt-2 border-t border-surfaceBorder/60">
                    <span className="text-[11px] text-slate-400">★ {match.user.reputationScore}</span>
                    <Link
                      href={`/dashboard/discover`}
                      className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
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
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Repeat className="w-5 h-5 text-cyan-400" /> Active Skill Exchanges
              </h2>
              <Link href="/dashboard/swaps" className="text-xs text-indigo-400 font-semibold hover:underline">
                Manage Swaps
              </Link>
            </div>

            {activeSwaps.length === 0 ? (
              <div className="p-8 text-center border border-dashed border-surfaceBorder rounded-xl space-y-2">
                <p className="text-xs text-slate-400">No active exchanges in progress.</p>
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
                        <span className="text-xs font-bold text-white">
                          Teach {swap.offeredSkill.name} ↔ Learn {swap.requestedSkill.name}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {swap.learningProgress?.percentage || 0}% Progress
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">
                        Partner: {swap.sender.profile?.fullName === user?.profile?.fullName ? swap.receiver.profile?.fullName : swap.sender.profile?.fullName}
                      </p>
                    </div>

                    <Link
                      href={`/dashboard/chat?conversationId=${swap.conversation?.id}`}
                      className="px-3 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white hover:border-indigo-500"
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
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-950/30 to-surface space-y-4">
            <div className="flex items-center gap-2 text-indigo-400">
              <Sparkles className="w-5 h-5" />
              <h3 className="font-bold text-white text-sm">AI Career Assistant</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
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
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400" /> Upcoming Sessions
              </h3>
              <Link href="/dashboard/sessions" className="text-xs text-indigo-400 hover:underline">
                Schedule
              </Link>
            </div>

            {sessions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-4">No scheduled learning sessions.</p>
            ) : (
              <div className="space-y-3">
                {sessions.slice(0, 3).map((sess: any) => (
                  <div key={sess.id} className="p-3 rounded-lg bg-surface border border-surfaceBorder space-y-1">
                    <p className="text-xs font-bold text-white">{sess.title}</p>
                    <p className="text-[11px] text-slate-400">
                      {new Date(sess.scheduledAt).toLocaleString()} ({sess.durationMinutes} mins)
                    </p>
                    {sess.meetingUrl && (
                      <a
                        href={sess.meetingUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] text-cyan-400 font-semibold hover:underline block pt-1"
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
