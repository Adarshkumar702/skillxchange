'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { Sparkles, Send, MapPin, CheckCircle, ArrowRight, User } from 'lucide-react';

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hello! I am your SkillXchange AI Career Assistant. Ask me about personalized learning roadmaps, placement preparation strategies, or missing backend/frontend competencies!',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Developer');
  const [roadmap, setRoadmap] = useState<any[] | null>(null);

  // AI Chat Mutation
  const chatMutation = useMutation({
    mutationFn: (data: any) => fetchApi('/ai/chat', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (res) => {
      if (res.success && res.data?.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
      }
    },
  });

  // AI Roadmap Mutation
  const roadmapMutation = useMutation({
    mutationFn: (data: any) => fetchApi('/ai/career-roadmap', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (res) => {
      if (res.success && res.data) {
        setRoadmap(res.data);
      }
    },
  });

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMsg = inputText;
    setMessages((prev) => [...prev, { role: 'user', content: userMsg }]);
    setInputText('');

    chatMutation.mutate({
      message: userMsg,
      conversationHistory: messages.slice(-6),
    });
  };

  const handleGenerateRoadmap = () => {
    roadmapMutation.mutate({ targetRoleTitle: targetRole, timelineDays: 30 });
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-surface to-background space-y-2">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-400" /> AI Career Assistant & 30-Day Roadmap Generator
        </h1>
        <p className="text-xs text-slate-300">
          Abstracted AI Service powered by Gemini / OpenAI API with fallback rule-engine.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: AI Interactive Chat */}
        <div className="lg:col-span-2 glass-panel rounded-2xl border border-surfaceBorder h-[550px] flex flex-col justify-between overflow-hidden shadow-2xl">
          <div className="p-4 border-b border-surfaceBorder text-xs font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" /> Live Career Advisory Chat
          </div>

          <div className="flex-1 p-4 overflow-y-auto space-y-4">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[80%] p-4 rounded-2xl text-xs space-y-1 ${
                    m.role === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-surface border border-surfaceBorder text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap leading-relaxed">{m.content}</p>
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="text-xs text-indigo-400 animate-pulse">AI Assistant is thinking...</div>
            )}
          </div>

          <form onSubmit={handleSendChat} className="p-4 border-t border-surfaceBorder flex gap-2 glass-panel">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-surfaceBorder text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="Ask AI: 'What skills should I prioritize for backend placements?'"
            />
            <button type="submit" disabled={chatMutation.isPending} className="btn-primary px-4 py-2.5 rounded-xl">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Right Column: Instant 30-Day Roadmap Generator */}
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-400" /> Generate AI Roadmap
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Target Job Role</label>
              <select
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
              >
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Software Engineer">Software Engineer (SDE)</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="Data Scientist">Data Scientist</option>
              </select>
            </div>

            <button
              onClick={handleGenerateRoadmap}
              disabled={roadmapMutation.isPending}
              className="w-full btn-primary text-xs font-semibold py-2.5 flex items-center justify-center gap-1.5"
            >
              {roadmapMutation.isPending ? 'Generating...' : 'Build 30-Day Action Plan'} <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Render Generated Roadmap Steps */}
          {roadmap && (
            <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider text-emerald-400">
                30-Day {targetRole} Roadmap
              </h4>

              <div className="space-y-3">
                {roadmap.map((step: any, idx: number) => (
                  <div key={idx} className="p-3 rounded-xl bg-surface border border-surfaceBorder space-y-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {step.dayRange}
                    </span>
                    <h5 className="text-xs font-bold text-white pt-1">{step.title}</h5>
                    <p className="text-[11px] text-slate-400 leading-relaxed">{step.description}</p>
                    <div className="pt-1 text-[10px] text-cyan-300 font-medium">
                      💡 Project: {step.recommendedProject}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
