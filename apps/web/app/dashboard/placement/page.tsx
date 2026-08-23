'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { Target, Sparkles, CheckCircle, Code, Cpu, BookOpen, User } from 'lucide-react';

export default function PlacementPage() {
  const { data: readinessRes, isLoading } = useQuery({
    queryKey: ['placementReadinessScore'],
    queryFn: () => fetchApi('/placement/readiness'),
  });

  const placement = readinessRes?.data;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-cyan-500/20 bg-gradient-to-r from-cyan-950/30 via-surface to-background space-y-2">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Target className="w-5 h-5 text-cyan-400" /> Placement Readiness Dashboard
        </h1>
        <p className="text-xs text-slate-300">
          Target Role: <strong>{placement?.careerRole?.title || 'Full Stack Developer'}</strong> ({placement?.careerRole?.averageSalary || '$105,000/yr'})
        </p>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-400">Calculating placement score...</p>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Score Breakdown */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-6">
            <div className="flex items-center justify-between border-b border-surfaceBorder pb-4">
              <div>
                <h2 className="text-base font-bold text-white">Readiness Breakdown</h2>
                <p className="text-xs text-slate-400">Score evaluates coding, system design, tech stack & soft skills.</p>
              </div>
              <div className="text-right">
                <span className="text-4xl font-extrabold text-cyan-300">{placement?.overallScore}%</span>
                <span className="text-xs text-slate-400 block font-semibold">Overall Readiness</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <Code className="w-4 h-4 text-indigo-400" /> Data Structures & Algorithms (DSA)
                  </span>
                  <span className="font-bold text-indigo-400">{placement?.dsaScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-surfaceBorder rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500" style={{ width: `${placement?.dsaScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-cyan-400" /> Tech Stack & Framework Mastery
                  </span>
                  <span className="font-bold text-cyan-400">{placement?.techStackScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-surfaceBorder rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-400" style={{ width: `${placement?.techStackScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" /> System Design & Microservices
                  </span>
                  <span className="font-bold text-amber-400">{placement?.systemDesignScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-surfaceBorder rounded-full overflow-hidden">
                  <div className="h-full bg-amber-400" style={{ width: `${placement?.systemDesignScore}%` }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-200 font-semibold flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" /> Communication & Soft Skills
                  </span>
                  <span className="font-bold text-emerald-400">{placement?.softSkillsScore}%</span>
                </div>
                <div className="w-full h-2.5 bg-surfaceBorder rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500" style={{ width: `${placement?.softSkillsScore}%` }} />
                </div>
              </div>
            </div>
          </div>

          {/* Practice Topics & Next Steps */}
          <div className="space-y-6">
            <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
              <h3 className="text-sm font-bold text-white">Recommended Practice Topics</h3>
              <ul className="space-y-2 text-xs text-slate-300">
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Binary Search & Two Pointers</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-indigo-400" /> Graph Traversal (DFS/BFS)</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> PostgreSQL Indexes & Query Optimization</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-cyan-400" /> Redis Cache Invalidation & Rate Limiting</li>
                <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-amber-400" /> WebSockets & Socket.IO Real-time Architecture</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
