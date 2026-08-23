import React from 'react';
import Link from 'next/link';
import { Sparkles, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-surfaceBorder bg-background py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-4 md:col-span-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-lg text-white">SkillXchange</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            "Learn. Teach. Exchange. Grow."<br />
            The AI-powered skill swap platform engineered for university students, developers, and placement candidates.
          </p>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Platform</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link href="/dashboard/discover" className="hover:text-indigo-400">Discover Matches</Link></li>
            <li><Link href="/dashboard/placement" className="hover:text-indigo-400">Placement Readiness</Link></li>
            <li><Link href="/dashboard/skill-gap" className="hover:text-indigo-400">Skill Gap Analyzer</Link></li>
            <li><Link href="/dashboard/ai-assistant" className="hover:text-indigo-400">AI Career Assistant</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Community</h4>
          <ul className="space-y-2 text-xs text-slate-400">
            <li><Link href="/dashboard/swaps" className="hover:text-indigo-400">Skill Exchanges</Link></li>
            <li><Link href="/dashboard/achievements" className="hover:text-indigo-400">Achievements & Badges</Link></li>
            <li><Link href="/dashboard/ratings" className="hover:text-indigo-400">Peer Reviews</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold text-white mb-3">Connect</h4>
          <div className="flex gap-3 text-slate-400">
            <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Github className="w-5 h-5" />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Twitter className="w-5 h-5" />
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">
              <Linkedin className="w-5 h-5" />
            </a>
          </div>
          <p className="text-[11px] text-slate-500 mt-4">
            © 2026 SkillXchange Inc. Built for top software placement portfolios.
          </p>
        </div>
      </div>
    </footer>
  );
}
