'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { ShieldCheck, Users, Repeat, Star, BookOpen, AlertTriangle } from 'lucide-react';

export default function AdminPage() {
  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => fetchApi('/admin/analytics'),
  });

  const { data: reportsRes } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => fetchApi('/admin/reports'),
  });

  const overview = analyticsRes?.data?.overview;
  const recentUsers = analyticsRes?.data?.recentUsers || [];
  const reports = reportsRes?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-surface to-background space-y-2">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-amber-400" /> Admin Platform Dashboard & Analytics
        </h1>
        <p className="text-xs text-slate-300">
          Supervise user registrations, swap request metrics, platform health, and content moderation queue.
        </p>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-400">Loading admin metrics...</p>
      ) : (
        <>
          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Total Users</span>
              <p className="text-2xl font-bold text-white">{overview?.totalUsers || 0}</p>
              <p className="text-[11px] text-slate-400">{overview?.dailyActiveUsers || 0} DAU • {overview?.monthlyActiveUsers || 0} MAU</p>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Total Skills Catalog</span>
              <p className="text-2xl font-bold text-indigo-400">{overview?.totalSkills || 0}</p>
              <p className="text-[11px] text-slate-400">Centralized database skills</p>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Total Exchanges</span>
              <p className="text-2xl font-bold text-cyan-400">{overview?.totalSwaps || 0}</p>
              <p className="text-[11px] text-slate-400">{overview?.completedSwaps || 0} completed swaps</p>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Average Platform Rating</span>
              <p className="text-2xl font-bold text-amber-400">{overview?.averageRating || 5.0} ★</p>
              <p className="text-[11px] text-slate-400">{overview?.totalRatings || 0} reviews submitted</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Registered Users */}
            <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-400" /> Recent User Registrations
              </h3>
              <div className="space-y-3">
                {recentUsers.map((u: any) => (
                  <div key={u.id} className="p-3 rounded-lg bg-surface border border-surfaceBorder flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">{u.profile?.fullName || u.email}</p>
                      <p className="text-[11px] text-slate-400">{u.profile?.university || 'Student'}</p>
                    </div>
                    <span className="text-[10px] text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Moderation Queue */}
            <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" /> Content Moderation Queue
              </h3>

              {reports.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">No reported users or content items.</p>
              ) : (
                <div className="space-y-3">
                  {reports.map((rep: any) => (
                    <div key={rep.id} className="p-3 rounded-lg bg-surface border border-surfaceBorder space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="font-bold text-red-400">Reason: {rep.reason}</span>
                        <span className="text-[10px] text-slate-400">{rep.status}</span>
                      </div>
                      <p className="text-[11px] text-slate-300">Reporter: {rep.reporter?.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
