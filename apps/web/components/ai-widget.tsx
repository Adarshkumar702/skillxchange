'use client';

import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { fetchApi } from '../lib/apiClient';
import { Sparkles, MessageSquare, X, Send } from 'lucide-react';

export function AIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: 'Hi! Need advice on skill roadmaps or placement prep? Ask me anything!',
    },
  ]);

  const chatMutation = useMutation({
    mutationFn: (data: any) => fetchApi('/ai/chat', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (res) => {
      if (res.success && res.data?.reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: res.data.reply }]);
      }
    },
  });

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const msg = inputText;
    setMessages((prev) => [...prev, { role: 'user', content: msg }]);
    setInputText('');

    chatMutation.mutate({
      message: msg,
      conversationHistory: messages.slice(-4),
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="glass-panel w-80 sm:w-96 h-[460px] rounded-2xl border border-surfaceBorder flex flex-col justify-between shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-5">
          {/* Widget Header */}
          <div className="p-3.5 bg-slate-900 dark:bg-slate-950 text-white flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <span>SkillXchange AI Assistant</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 p-3.5 overflow-y-auto space-y-3 bg-surface/50 text-xs">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] p-3 rounded-xl leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 rounded-br-none'
                      : 'bg-surface border border-surfaceBorder text-textMain rounded-bl-none'
                  }`}
                >
                  {m.content}
                </div>
              </div>
            ))}
            {chatMutation.isPending && (
              <div className="text-[11px] text-cyan-500 font-medium animate-pulse">
                AI is formulating answer...
              </div>
            )}
          </div>

          {/* Input Form */}
          <form onSubmit={handleSend} className="p-3 border-t border-surfaceBorder flex gap-2 glass-panel">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain focus:outline-none focus:border-slate-400"
              placeholder="Ask AI a question..."
            />
            <button type="submit" disabled={chatMutation.isPending} className="btn-primary p-2 rounded-lg flex items-center justify-center">
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="w-12 h-12 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xl flex items-center justify-center hover:scale-105 transition-transform"
          title="Open AI Assistant"
        >
          <Sparkles className="w-5 h-5 text-cyan-400 dark:text-cyan-600" />
        </button>
      )}
    </div>
  );
}
