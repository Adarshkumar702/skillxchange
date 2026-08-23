'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { Brain, CheckCircle, AlertTriangle, User, ArrowRight } from 'lucide-react';

export default function SkillGapPage() {
  const [targetRoleTitle, setTargetRoleTitle] = useState('Full Stack Developer');
  const [gapData, setGapData] = useState<any | null>(null);

  const gapMutation = useMutation({
    mutationFn: (data: any) => fetchApi('/ai/analyze-skill-gap', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (res) => {
      if (res.success && res.data) {
        setGapData(res.data);
      }
    },
  });

  const handleAnalyze = (e: React.FormEvent) => {
    e.preventDefault();
    gapMutation.mutate({ targetRoleTitle });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Brain className="w-5 h-5 text-indigo-400" /> AI Skill Gap Analyzer
        </h1>
        <p className="text-xs text-slate-400">
          Compare your current skills against industry placement roles and discover recommended peer mentors to bridge missing gaps.
        </p>

        <form onSubmit={handleAnalyze} className="flex flex-col sm:flex-row gap-3 pt-2">
          <select
            value={targetRoleTitle}
            onChange={(e) => setTargetRoleTitle(e.target.value)}
            className="flex-1 p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
          >
            <option value="Full Stack Developer">Full Stack Developer</option>
            <option value="Software Engineer">Software Engineer (SDE)</option>
            <option value="Backend Developer">Backend Developer</option>
            <option value="Frontend Developer">Frontend Developer</option>
            <option value="Data Scientist">Data Scientist / Analyst</option>
          </select>

          <button type="submit" disabled={gapMutation.isPending} className="btn-primary text-xs font-semibold px-6 py-2.5">
            {gapMutation.isPending ? 'Analyzing Gap...' : 'Run Skill Gap Analysis'}
          </button>
        </form>
      </div>

      {/* Analysis Results Display */}
      {gapData && (
        <div className="space-y-6">
          {/* Match Banner */}
          <div className="glass-panel p-6 rounded-2xl border border-indigo-500/30 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white">Target Role: {gapData.targetRole}</h2>
              <p className="text-xs text-slate-400">Calculated based on your verified user skills database profile.</p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-extrabold text-cyan-400">{gapData.currentMatchPercentage}%</span>
              <span className="text-xs text-slate-400 block">Overall Match</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Acquired Skills */}
            <div className="glass-card p-6 rounded-2xl border border-surfaceBorder space-y-3">
              <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Acquired Skills You Possess
              </h3>
              <div className="flex flex-wrap gap-2 pt-2">
                {gapData.acquiredSkills?.map((sk: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium">
                    ✓ {sk}
                  </span>
                ))}
              </div>
            </div>

            {/* Missing Critical Skills */}
            <div className="glass-card p-6 rounded-2xl border border-surfaceBorder space-y-3">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Missing Critical Skills To Acquire
              </h3>
              <div className="flex flex-wrap gap-2 pt-2">
                {gapData.missingCriticalSkills?.map((sk: string, i: number) => (
                  <span key={i} className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-medium">
                    ⚡ {sk}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Recommended Mentors for Missing Skills */}
          {gapData.mentorProfiles && gapData.mentorProfiles.length > 0 && (
            <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
              <h3 className="text-sm font-bold text-white">Recommended Mentors for Missing Skills</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {gapData.mentorProfiles.map((m: any, i: number) => (
                  <div key={i} className="glass-card p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{m.fullName}</h4>
                      <p className="text-[11px] text-slate-400">{m.university}</p>
                      <span className="text-[10px] text-indigo-300 font-semibold block pt-1">Teaches: {m.teachSkill}</span>
                    </div>
                    <a href="/dashboard/discover" className="btn-primary text-xs px-3 py-1.5">
                      Connect
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
