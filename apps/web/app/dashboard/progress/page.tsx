'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { LineChart, CheckCircle2, Circle } from 'lucide-react';

export default function ProgressPage() {
  const { data: swapsRes, isLoading } = useQuery({
    queryKey: ['activeSwapsProgress'],
    queryFn: () => fetchApi('/swaps?status=ACCEPTED'),
  });

  const swaps = swapsRes?.data || [];

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-2">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <LineChart className="w-5 h-5 text-indigo-400" /> Skill Exchange Progress Tracker
        </h1>
        <p className="text-xs text-slate-400">Track syllabus milestone check-ins, percentage completion, and session history.</p>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-400">Loading progress data...</p>
      ) : swaps.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <p className="text-xs text-slate-400">No active exchange progress records found.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {swaps.map((swap: any) => (
            <div key={swap.id} className="glass-card p-6 rounded-2xl border border-surfaceBorder space-y-4">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    {swap.offeredSkill.name} ↔ {swap.requestedSkill.name}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Partner: {swap.receiver.profile?.fullName || swap.sender.profile?.fullName}
                  </p>
                </div>
                <span className="text-sm font-extrabold text-indigo-400">
                  {swap.learningProgress?.percentage || 0}%
                </span>
              </div>

              <div className="w-full h-3 bg-surfaceBorder rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-500 to-cyan-400"
                  style={{ width: `${swap.learningProgress?.percentage || 0}%` }}
                />
              </div>

              <div className="space-y-2 pt-2 border-t border-surfaceBorder">
                <p className="text-xs font-semibold text-slate-300">Syllabus Milestones:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-400">
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Syntax & Environment Setup</div>
                  <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Core Concepts & Architecture</div>
                  <div className="flex items-center gap-2"><Circle className="w-4 h-4 text-slate-500" /> Advanced Patterns & Async Operations</div>
                  <div className="flex items-center gap-2"><Circle className="w-4 h-4 text-slate-500" /> Capstone Project & Code Review</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
