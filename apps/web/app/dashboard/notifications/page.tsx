'use client';

import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { Bell, CheckCheck, Sparkles } from 'lucide-react';

export default function NotificationsPage() {
  const queryClient = useQueryClient();

  const { data: notifsRes, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => fetchApi('/notifications'),
  });

  const notifications = notifsRes?.data || [];

  const markAllReadMutation = useMutation({
    mutationFn: () => fetchApi('/notifications/read-all', { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Bell className="w-5 h-5 text-indigo-400" /> Notifications Center
          </h1>
          <p className="text-xs text-slate-400">Real-time alerts for swap requests, session reminders, ratings, and achievements.</p>
        </div>

        <button
          onClick={() => markAllReadMutation.mutate()}
          className="px-3.5 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-slate-300 hover:text-white flex items-center gap-1.5"
        >
          <CheckCheck className="w-4 h-4" /> Mark All as Read
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-400">Loading notifications...</p>
      ) : notifications.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Bell className="w-10 h-10 text-slate-500 mx-auto" />
          <p className="text-xs text-slate-400">You have no unread notifications.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((n: any) => (
            <div
              key={n.id}
              className={`glass-card p-4 rounded-xl border flex items-center justify-between ${
                n.isRead ? 'border-surfaceBorder opacity-70' : 'border-indigo-500/30 bg-indigo-950/20'
              }`}
            >
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-white">{n.title}</h4>
                <p className="text-xs text-slate-300">{n.message}</p>
                <span className="text-[10px] text-slate-500 block">
                  {new Date(n.createdAt).toLocaleString()}
                </span>
              </div>

              {n.linkUrl && (
                <a href={n.linkUrl} className="btn-primary text-xs px-3 py-1.5">
                  View
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
