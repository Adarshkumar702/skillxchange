'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '../../../lib/apiClient';
import { getSocket } from '../../../lib/socketClient';
import { useAuth } from '../../../lib/authContext';
import { MessageSquare, Send, User, Sparkles, Video, Clock } from 'lucide-react';
import Link from 'next/link';

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get('conversationId');

  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationParam);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Fetch conversations
  const { data: convsRes } = useQuery({
    queryKey: ['conversations'],
    queryFn: () => fetchApi('/conversations'),
  });

  const conversations = convsRes?.data || [];

  useEffect(() => {
    if (!activeConversationId && conversations.length > 0) {
      setActiveConversationId(conversations[0].id);
    }
  }, [conversations, activeConversationId]);

  // Fetch messages for active conversation
  useEffect(() => {
    if (!activeConversationId) return;

    fetchApi(`/conversations/${activeConversationId}/messages`).then((res) => {
      if (res.success && res.data) {
        setMessages(res.data);
      }
    });

    const socket = getSocket();
    if (socket) {
      socket.emit('join_conversation', activeConversationId);

      const handleNewMessage = (msg: any) => {
        if (msg.conversationId === activeConversationId) {
          setMessages((prev) => {
            // Prevent duplicate message rendering
            if (prev.some((m) => m.id === msg.id)) return prev;
            return [...prev, msg];
          });
        }
      };

      socket.on('new_message', handleNewMessage);

      return () => {
        socket.emit('leave_conversation', activeConversationId);
        socket.off('new_message', handleNewMessage);
      };
    }
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId || sending) return;

    const messageContent = inputText;
    setInputText('');
    setSending(true);

    // 1. Send via HTTP REST API (guarantees PostgreSQL persistence)
    const res = await fetchApi(`/conversations/${activeConversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content: messageContent }),
    });

    setSending(false);

    if (res.success && res.data) {
      const newMsg = res.data;
      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, newMsg];
      });

      // 2. Broadcast via WebSockets to recipient
      const socket = getSocket();
      if (socket) {
        socket.emit('send_message', newMsg);
      }
    }
  };

  const activeConv = conversations.find((c: any) => c.id === activeConversationId);
  const partner = activeConv?.members.find((m: any) => m.userId !== user?.id)?.user?.profile;

  return (
    <div className="glass-panel rounded-2xl border border-surfaceBorder h-[calc(100vh-140px)] flex flex-col md:flex-row overflow-hidden shadow-2xl">
      {/* Sidebar: Conversations List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-surfaceBorder p-4 space-y-4 flex-shrink-0 bg-surface/30">
        <h2 className="text-sm font-bold text-textMain flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-500" /> Real-Time Messages
        </h2>

        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
          {conversations.length === 0 ? (
            <p className="text-xs text-textMuted py-8 text-center">No active chat conversations yet.</p>
          ) : (
            conversations.map((c: any) => {
              const partnerProfile = c.members.find((m: any) => m.userId !== user?.id)?.user?.profile;
              const isSelected = c.id === activeConversationId;

              return (
                <button
                  key={c.id}
                  onClick={() => setActiveConversationId(c.id)}
                  className={`w-full p-3 rounded-xl text-left flex items-center gap-3 transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-sm border border-slate-700'
                      : 'hover:bg-surface border border-transparent text-textMuted'
                  }`}
                >
                  <img
                    src={partnerProfile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full border border-blue-400"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{partnerProfile?.fullName || 'Peer Partner'}</p>
                    <p className="text-[11px] opacity-80 truncate">
                      {c.messages[0]?.content || 'Exchange initiated'}
                    </p>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Main Chat Feed */}
      <div className="flex-1 flex flex-col justify-between bg-background/50">
        {/* Chat Header */}
        {partner ? (
          <div className="p-4 border-b border-surfaceBorder flex items-center justify-between glass-panel">
            <div className="flex items-center gap-3">
              <img
                src={partner.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                alt="Avatar"
                className="w-9 h-9 rounded-full border border-blue-400 object-cover"
              />
              <div>
                <h3 className="text-xs font-bold text-textMain">{partner.fullName}</h3>
                <p className="text-[10px] text-textMuted">{partner.university}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/dashboard/sessions"
                className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-cyan-400 border border-blue-500/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-blue-500/20 transition-colors"
              >
                <Video className="w-3.5 h-3.5 text-blue-500" /> Start 1-on-1 Video Session
              </Link>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-bold">
                Online Live
              </span>
            </div>
          </div>
        ) : (
          <div className="p-4 border-b border-surfaceBorder text-xs text-textMuted">
            Select a conversation to start chatting.
          </div>
        )}

        {/* Message Items Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg: any) => {
            const isMe = msg.senderId === user?.id;

            return (
              <div key={msg.id || Math.random()} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 ${
                    isMe
                      ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 rounded-br-none shadow-md font-medium'
                      : 'bg-surface border border-surfaceBorder text-textMain rounded-bl-none font-medium'
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <span className="text-[9px] opacity-60 block text-right">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                  </span>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input Bar */}
        {activeConversationId && (
          <form onSubmit={handleSendMessage} className="p-4 border-t border-surfaceBorder flex gap-2 glass-panel">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-surfaceBorder text-xs text-textMain focus:outline-none focus:border-slate-400"
              placeholder="Type your message..."
            />
            <button type="submit" disabled={sending} className="btn-primary px-4 py-2.5 rounded-xl flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
