'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '../components/navbar';
import { Footer } from '../components/footer';
import {
  Sparkles,
  ArrowRight,
  Target,
  CheckCircle,
  HelpCircle,
  X,
  Users,
  Video,
  Star,
  Award,
  BookOpen,
  Send,
  Zap,
} from 'lucide-react';

export default function LandingPage() {
  const [showHowItWorksModal, setShowHowItWorksModal] = useState(false);
  const [activeStepTab, setActiveStepTab] = useState(1);

  const scrollToHowItWorks = () => {
    const el = document.getElementById('how-it-works-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const stepsData = [
    {
      id: 1,
      number: 'Step 01',
      icon: BookOpen,
      color: 'text-blue-500 bg-blue-500/10 border-blue-500/30',
      title: 'Create Profile & Set Your Skills',
      headline: 'Tell us what you can teach and what you want to learn.',
      desc: 'Register your free student account. List skills you feel comfortable teaching (e.g. React, C++, Web Development) and skills you are eager to master (e.g. Python, Docker, System Design).',
      tip: '💡 Tip: Even beginner-level teaching helps peers who are just getting started!',
    },
    {
      id: 2,
      number: 'Step 02',
      icon: Sparkles,
      color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/30',
      title: 'AI Reciprocal Skill Matching',
      headline: 'Our smart algorithm finds your perfect peer partner.',
      desc: 'SkillXchange matches you with students who have opposite learning needs. For example: You teach Student B React, while Student B teaches you Python! Zero money involved.',
      tip: '🤖 AI score calculates exact compatibility (e.g. 98% Match accuracy).',
    },
    {
      id: 3,
      number: 'Step 03',
      icon: Send,
      color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/30',
      title: 'Send a 1-Click Swap Request',
      headline: 'Connect with verified peers and mentors instantly.',
      desc: 'Browse student profiles, inspect verified badges, university details, and reputation scores. Click "Send Swap Request" to propose a 1-on-1 skill exchange.',
      tip: '✉️ Once accepted, a private chat and session schedule is automatically unlocked.',
    },
    {
      id: 4,
      number: 'Step 04',
      icon: Video,
      color: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/30',
      title: '1-on-1 HD Video & Live Chat',
      headline: 'Learn live in dedicated high-definition video rooms.',
      desc: 'Join direct 1-on-1 HD video call rooms with zero lobby waiting. Use right-side live chat, share screens, review code together, and complete learning milestones.',
      tip: '📹 Works seamlessly across desktop browsers and mobile devices.',
    },
    {
      id: 5,
      number: 'Step 05',
      icon: Star,
      color: 'text-amber-500 bg-amber-500/10 border-amber-500/30',
      title: 'Peer Ratings & Placement Readiness',
      headline: 'Build reputation, earn badges, and get job-ready.',
      desc: 'After each session, rate your partner. Earn reputation stars, unlock achievement badges, and analyze your placement readiness score for top software developer roles.',
      tip: '🏆 Boost your resume with verified peer mentorship credentials.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 px-6 overflow-hidden">
        <div className="max-w-5xl mx-auto text-center space-y-8 relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-indigo-400 text-xs font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen AI Skill Swap & Placement Platform
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Learn from others. <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800 dark:from-indigo-400 dark:via-cyan-300 dark:to-indigo-200">
              Teach what you know.
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-medium">
            SkillXchange connects students who want to learn with peers ready to teach. Swap skills like React, Python, Docker, and System Design with smart AI matching and real-time guidance.
          </p>

          {/* Action Buttons with Prominent "How it works?" Button */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/register" className="btn-primary px-7 py-3.5 text-base font-semibold flex items-center gap-2 w-full sm:w-auto justify-center shadow-lg">
              Find Your Skill Match <ArrowRight className="w-5 h-5" />
            </Link>

            {/* HOW IT WORKS BUTTON */}
            <button
              onClick={() => {
                setShowHowItWorksModal(true);
                scrollToHowItWorks();
              }}
              className="px-7 py-3.5 text-base font-bold rounded-xl bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-emerald-500/10 border-2 border-blue-500/40 text-blue-600 dark:text-indigo-300 hover:border-blue-500 hover:bg-blue-500/20 transition-all w-full sm:w-auto flex items-center justify-center gap-2 shadow-md active:scale-95"
            >
              <HelpCircle className="w-5 h-5 text-blue-500" /> How it works?
            </button>

            <Link href="/dashboard/discover" className="px-7 py-3.5 text-base font-semibold rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:border-slate-400 transition-all w-full sm:w-auto text-center shadow-sm">
              Explore Skills
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="pt-12 grid grid-cols-2 md:grid-cols-4 gap-4 border-t border-slate-300 dark:border-slate-800 max-w-4xl mx-auto">
            <div>
              <p className="text-2xl font-extrabold text-slate-900 dark:text-white">98%</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Match Accuracy</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-blue-600 dark:text-cyan-400">1,200+</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Exchanges Completed</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400">50+</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Tech Skills Available</p>
            </div>
            <div>
              <p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400">4.9/5.0</p>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">Peer Rating</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works-section" className="py-20 px-6 bg-slate-200/50 dark:bg-slate-950/60 border-y border-slate-300 dark:border-slate-800">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <Zap className="w-3.5 h-3.5" /> Beginner's Platform Workflow
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">How SkillXchange Works</h2>
            <p className="text-sm font-medium text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
              SkillXchange is 100% free. No tuition fees or payments. Exchange your knowledge with peers in 4 simple steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Create Profile', desc: 'Add skills you can teach (e.g. React) and skills you want to learn (e.g. Python).' },
              { step: '02', title: 'AI Match Engine', desc: 'Our algorithm identifies reciprocal compatibility score (e.g. 98% Match).' },
              { step: '03', title: 'Chat & Sessions', desc: 'Connect live, schedule structured 1-on-1 sessions, and track checklist milestones.' },
              { step: '04', title: 'Rate & Unlock', desc: 'Complete exchanges, earn peer ratings, unlock achievements, and boost placement readiness.' },
            ].map((item) => (
              <div key={item.step} className="glass-card p-6 rounded-2xl space-y-3 relative overflow-hidden shadow-sm hover:border-blue-500/40 transition-all">
                <span className="text-4xl font-extrabold text-slate-300 dark:text-indigo-500/20 absolute top-4 right-4">{item.step}</span>
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-600 dark:text-indigo-400 font-bold text-sm">
                  {item.step}
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
                <p className="text-xs font-medium text-slate-600 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center pt-4">
            <button
              onClick={() => setShowHowItWorksModal(true)}
              className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-lg inline-flex items-center gap-2 transition-all transform active:scale-95"
            >
              <HelpCircle className="w-4 h-4" /> Open Full Interactive "How It Works" Guide
            </button>
          </div>
        </div>
      </section>

      {/* Popular Skills & Placement Readiness */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-12 w-full">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-cyan-400 text-xs font-semibold">
              <Target className="w-3.5 h-3.5" /> Career Boost Feature
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">Placement Readiness & Skill Gap Analyzer</h2>
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed font-medium">
              Target top software engineer and full-stack developer roles. SkillXchange analyzes your current skill set against industry requirements, calculating your readiness score and recommending mentors to fill missing gaps.
            </p>
            <div className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Dynamic DSA & System Design Radar Scores</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Automated 30-Day Personalized Learning Roadmaps</div>
              <div className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Direct connection to student mentors for missing skills</div>
            </div>
            <Link href="/register" className="inline-block btn-primary text-sm">
              Check Your Placement Score
            </Link>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-4 border border-slate-300 dark:border-surfaceBorder shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-300 dark:border-surfaceBorder pb-3">
              <span className="text-sm font-bold text-slate-900 dark:text-white">Target Role: Full Stack Developer</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">79% Ready</span>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1"><span className="text-slate-700 dark:text-slate-300">DSA & Algorithms</span><span className="text-indigo-600 dark:text-indigo-400 font-bold">75%</span></div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-surfaceBorder rounded-full overflow-hidden"><div className="h-full bg-indigo-600 dark:bg-indigo-500" style={{ width: '75%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1"><span className="text-slate-700 dark:text-slate-300">Tech Stack (React/Node)</span><span className="text-blue-600 dark:text-cyan-400 font-bold">90%</span></div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-surfaceBorder rounded-full overflow-hidden"><div className="h-full bg-blue-600 dark:bg-cyan-400" style={{ width: '90%' }} /></div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1"><span className="text-slate-700 dark:text-slate-300">System Design</span><span className="text-amber-600 dark:text-amber-400 font-bold">65%</span></div>
                <div className="w-full h-2.5 bg-slate-200 dark:bg-surfaceBorder rounded-full overflow-hidden"><div className="h-full bg-amber-500" style={{ width: '65%' }} /></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-slate-900 text-white border-t border-slate-800 text-center">
        <div className="max-w-3xl mx-auto space-y-6">
          <h2 className="text-3xl font-extrabold text-white">Ready to elevate your developer career?</h2>
          <p className="text-slate-300 text-sm">Join hundreds of students exchanging skills today.</p>
          <Link href="/register" className="btn-primary px-8 py-3 text-sm font-semibold inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100">
            Create Free Account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* INTERACTIVE "HOW IT WORKS" BEGINNER GUIDE MODAL */}
      {showHowItWorksModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-blue-500/40 p-6 sm:p-8 rounded-3xl max-w-3xl w-full space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 overflow-hidden">
            {/* Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-5">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 font-bold text-xs border border-blue-500/30 uppercase tracking-widest">
                  <HelpCircle className="w-4 h-4 text-blue-400" /> Platform Walkthrough Guide
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white pt-1">
                  How SkillXchange Works (Beginner's Guide)
                </h3>
                <p className="text-xs text-slate-400">
                  A 100% free peer-to-peer skill swap and mentorship platform for students.
                </p>
              </div>

              <button
                onClick={() => setShowHowItWorksModal(false)}
                className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step Navigation Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
              {stepsData.map((step) => {
                const IconComponent = step.icon;
                const isActive = activeStepTab === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => setActiveStepTab(step.id)}
                    className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 flex-shrink-0 border ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
                    }`}
                  >
                    <IconComponent className="w-3.5 h-3.5" />
                    <span>{step.number}</span>
                  </button>
                );
              })}
            </div>

            {/* Active Step Detailed Showcase Card */}
            {(() => {
              const currentStep = stepsData.find((s) => s.id === activeStepTab) || stepsData[0];
              const IconComponent = currentStep.icon;

              return (
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-2xl border ${currentStep.color}`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-[10px] font-black uppercase text-blue-400 tracking-wider">
                        {currentStep.number} of 05
                      </span>
                      <h4 className="text-base sm:text-lg font-black text-white">{currentStep.title}</h4>
                    </div>
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold text-slate-200">{currentStep.headline}</h5>
                  <p className="text-xs text-slate-300 leading-relaxed font-medium">{currentStep.desc}</p>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-semibold text-amber-400">
                    {currentStep.tip}
                  </div>
                </div>
              );
            })()}

            {/* Action Footer */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                <Users className="w-4 h-4 text-emerald-400" />
                <span>Zero Money Involved • Student-to-Student Learning</span>
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                <button
                  onClick={() => setShowHowItWorksModal(false)}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-bold hover:text-white"
                >
                  Close Guide
                </button>

                <Link
                  href="/register"
                  onClick={() => setShowHowItWorksModal(false)}
                  className="btn-primary px-5 py-2.5 text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg"
                >
                  Start Learning Now <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
