'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSearchParams } from 'next/navigation';
import { fetchApi } from '../../../lib/apiClient';
import { getSocket } from '../../../lib/socketClient';
import { useAuth } from '../../../lib/authContext';
import { MessageSquare, Send, User, Sparkles } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const conversationParam = searchParams.get('conversationId');

  const [activeConversationId, setActiveConversationId] = useState<string | null>(conversationParam);
  const [messages, setMessages] = useState<any[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
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
    socket.emit('join_conversation', activeConversationId);

    const handleNewMessage = (msg: any) => {
      if (msg.conversationId === activeConversationId) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    socket.on('new_message', handleNewMessage);

    return () => {
      socket.emit('leave_conversation', activeConversationId);
      socket.off('new_message', handleNewMessage);
    };
  }, [activeConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConversationId) return;

    const socket = getSocket();
    socket.emit('send_message', {
      conversationId: activeConversationId,
      content: inputText,
    });

    setInputText('');
  };

  const activeConv = conversations.find((c: any) => c.id === activeConversationId);
  const partner = activeConv?.members.find((m: any) => m.userId !== user?.id)?.user?.profile;

  return (
    <div className="glass-panel rounded-2xl border border-surfaceBorder h-[calc(100vh-140px)] flex flex-col md:flex-row overflow-hidden shadow-2xl">
      {/* Sidebar: Conversations List */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-surfaceBorder p-4 space-y-4 flex-shrink-0 bg-surface/30">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-400" /> Real-Time Messages
        </h2>

        <div className="space-y-2 overflow-y-auto max-h-[calc(100vh-220px)]">
          {conversations.length === 0 ? (
            <p className="text-xs text-slate-500 py-8 text-center">No active chat conversations yet.</p>
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
                      ? 'bg-indigo-600/20 text-white border border-indigo-500/30'
                      : 'hover:bg-surface border border-transparent text-slate-300'
                  }`}
                >
                  <img
                    src={partnerProfile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full border border-indigo-400"
                  />
                  <div className="overflow-hidden">
                    <p className="text-xs font-bold truncate">{partnerProfile?.fullName || 'Peer Partner'}</p>
                    <p className="text-[11px] text-slate-400 truncate">
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
                className="w-8 h-8 rounded-full border border-indigo-400"
              />
              <div>
                <h3 className="text-xs font-bold text-white">{partner.fullName}</h3>
                <p className="text-[10px] text-slate-400">{partner.university}</p>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Online Socket Connected
            </span>
          </div>
        ) : (
          <div className="p-4 border-b border-surfaceBorder text-xs text-slate-400">
            Select a conversation to start chatting.
          </div>
        )}

        {/* Message Items Container */}
        <div className="flex-1 p-4 overflow-y-auto space-y-3">
          {messages.map((msg: any) => {
            const isMe = msg.senderId === user?.id;

            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] p-3 rounded-2xl text-xs space-y-1 ${
                    isMe
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white rounded-br-none shadow-md shadow-indigo-600/20'
                      : 'bg-surface border border-surfaceBorder text-slate-200 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <span className="text-[9px] opacity-60 block text-right">
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              className="flex-1 px-4 py-2.5 rounded-xl bg-surface border border-surfaceBorder text-xs text-white focus:outline-none focus:border-indigo-500"
              placeholder="Type your message..."
            />
            <button type="submit" className="btn-primary px-4 py-2.5 rounded-xl flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
