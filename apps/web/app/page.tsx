'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import {
  Sparkles,
  ArrowRight,
  Zap,
  Repeat,
  Target,
  Brain,
  Shield,
  Star,
  Users,
  CheckCircle,
  Code,
  BookOpen,
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-28 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-indigo-600/30 to-cyan-400/20 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold shadow-inner">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Skill Swap & Placement Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Learn from others. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-cyan-300 to-indigo-200">
              Teach what you know.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
            SkillXchange connects students who want to learn with peers ready to teach. Swap skills like React, Python, Docker, and System Design with smart AI matching and real-time guidance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="btn-primary px-8 py-3.5 text-base font-semibold flex items-center gap-2 w-full sm:w-auto justify-center">
              Find Your Skill Match <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/dashboard/discover" className="px-8 py-3.5 text-base font-semibold rounded-lg bg-surface border border-surfaceBorder text-slate-200 hover:border-indigo-500/40 transition-all w-full sm:w-auto text-center">
              Explore Skills
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-surfaceBorder/60 max-w-4xl mx-auto">
            <div>
              <p className="text-2xl font-bold text-white">98%</p>
              <p className="text-xs text-slate-400">Match Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-cyan-400">1,200+</p>
              <p className="text-xs text-slate-400">Exchanges Completed</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-indigo-400">50+</p>
              <p className="text-xs text-slate-400">Tech Skills Available</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-emerald-400">4.9/5.0</p>
              <p className="text-xs text-slate-400">Peer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-surface/50 border-y border-surfaceBorder">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-extrabold text-white">How SkillXchange Works</h2>
            <p className="text-sm text-slate-400">Master new competencies in 4 simple steps.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Create Profile', desc: 'Add skills you can teach (e.g. React) and skills you want to learn (e.g. Python).' },
              { step: '02', title: 'AI Match Engine', desc: 'Our algorithm identifies reciprocal compatibility score (e.g. 98% Match).' },
              { step: '03', title: 'Chat & Sessions', desc: 'Connect live, schedule structured 1-on-1 sessions, and track checklist milestones.' },
              { step: '04', title: 'Rate & Unlock', desc: 'Complete exchanges, earn peer ratings, unlock achievements, and boost placement readiness.' },
            ].map((item) => (
              <div key={item.step} className="glass-card p-6 rounded-2xl space-y-3 relative overflow-hidden">
                <span className="text-4xl font-extrabold text-indigo-500/20 absolute top-4 right-4">{item.step}</span>
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400 font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-white">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Skills & Placement Readiness */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
              <Target className="w-3.5 h-3.5" /> Career Boost Feature
            </div>
            <h2 className="text-3xl font-bold text-white">Placement Readiness & Skill Gap Analyzer</h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Target top software engineer and full-stack developer roles. SkillXchange analyzes your current skill set against industry requirements, calculating your readiness score and recommending mentors to fill missing gaps.
            </p>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Dynamic DSA & System Design Radar Scores</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Automated 30-Day Personalized Learning Roadmaps</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-400" /> Direct connection to student mentors for missing skills</div>
            </div>
            <Link href="/register" className="inline-block btn-primary text-sm">
              Check Your Placement Score
            </Link>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-surfaceBorder shadow-2xl">
            <div className="flex justify-between items-center border-b border-surfaceBorder pb-3">
              <span className="text-sm font-bold text-white">Target Role: Full Stack Developer</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">79% Ready</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">DSA & Algorithms</span><span className="text-indigo-400 font-bold">75%</span></div>
                <div className="w-full h-2 bg-surfaceBorder rounded-full overflow-hidden"><div className="h-full bg-indigo-500" style={{ width: '75%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">Tech Stack (React/Node)</span><span className="text-cyan-400 font-bold">90%</span></div>
                <div className="w-full h-2 bg-surfaceBorder rounded-full overflow-hidden"><div className="h-full bg-cyan-400" style={{ width: '90%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1"><span className="text-slate-300">System Design</span><span className="text-amber-400 font-bold">65%</span></div>
                <div className="w-full h-2 bg-surfaceBorder rounded-full overflow-hidden"><div className="h-full bg-amber-400" style={{ width: '65%' }} /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-indigo-950 via-background to-indigo-950 border-t border-surfaceBorder text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Ready to elevate your developer career?</h2>
          <p className="text-slate-300 text-sm">Join hundreds of students exchanging skills today.</p>
          <Link href="/register" className="btn-primary px-8 py-3 text-sm font-semibold inline-flex items-center gap-2">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
