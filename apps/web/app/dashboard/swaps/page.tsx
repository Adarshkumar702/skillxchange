'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { useAuth } from '../../../lib/authContext';
import { Repeat, Check, X, MessageSquare, Calendar, Star, CheckCircle, Clock } from 'lucide-react';

export default function SwapsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'PENDING' | 'ACCEPTED' | 'COMPLETED'>('PENDING');

  const { data: swapsRes, isLoading } = useQuery({
    queryKey: ['userSwaps', activeTab],
    queryFn: () => fetchApi(`/swaps?status=${activeTab}`),
  });

  const swaps = swapsRes?.data || [];

  // Accept swap mutation
  const acceptMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/swaps/${id}/accept`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userSwaps'] }),
  });

  // Reject swap mutation
  const rejectMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/swaps/${id}/reject`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userSwaps'] }),
  });

  // Complete swap mutation
  const completeMutation = useMutation({
    mutationFn: (id: string) => fetchApi(`/swaps/${id}/complete`, { method: 'PUT' }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['userSwaps'] }),
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
        <h1 className="text-xl font-bold text-white flex items-center gap-2">
          <Repeat className="w-5 h-5 text-indigo-400" /> Skill Exchange Dashboard
        </h1>
        <p className="text-xs text-slate-400">
          Track incoming & outgoing swap requests, active exchange workflows, and completed peer sessions.
        </p>

        {/* Status Tabs */}
        <div className="flex gap-2 border-b border-surfaceBorder pb-3">
          {(['PENDING', 'ACCEPTED', 'COMPLETED'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === tab
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {tab === 'PENDING' ? 'Pending Requests' : tab === 'ACCEPTED' ? 'Active Exchanges' : 'Completed Exchanges'}
            </button>
          ))}
        </div>
      </div>

      {/* Swaps List */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card p-4 rounded-xl animate-pulse h-20" />
          ))}
        </div>
      ) : swaps.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Repeat className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No {activeTab.toLowerCase()} exchanges found</h3>
          <p className="text-xs text-slate-400">Discover partners in the community to start swapping skills.</p>
          <Link href="/dashboard/discover" className="btn-primary inline-block text-xs">
            Discover Partners
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {swaps.map((swap: any) => {
            const isSender = swap.senderId === user?.id;
            const partner = isSender ? swap.receiver?.profile : swap.sender?.profile;

            return (
              <div key={swap.id} className="glass-card p-6 rounded-2xl border border-surfaceBorder space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={partner?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                      alt="Avatar"
                      className="w-10 h-10 rounded-full border border-indigo-400"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{partner?.fullName}</h3>
                      <p className="text-xs text-slate-400">{partner?.university}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                      Offered: {swap.offeredSkill.name}
                    </span>
                    <span className="text-xs text-slate-400">↔</span>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                      Requested: {swap.requestedSkill.name}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 bg-surface p-3 rounded-lg border border-surfaceBorder">
                  💬 "{swap.message}"
                </p>

                {/* Progress bar if active */}
                {swap.status === 'ACCEPTED' && swap.learningProgress && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-slate-300">
                      <span>Exchange Progress</span>
                      <span className="font-bold text-indigo-400">{swap.learningProgress.percentage}%</span>
                    </div>
                    <div className="w-full h-2 bg-surfaceBorder rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${swap.learningProgress.percentage}%` }} />
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-surfaceBorder">
                  {swap.status === 'PENDING' && !isSender && (
                    <>
                      <button
                        onClick={() => rejectMutation.mutate(swap.id)}
                        className="px-3.5 py-1.5 rounded-lg border border-red-500/30 text-red-400 hover:bg-red-500/10 text-xs font-semibold flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" /> Decline
                      </button>
                      <button
                        onClick={() => acceptMutation.mutate(swap.id)}
                        className="btn-primary text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" /> Accept Request
                      </button>
                    </>
                  )}

                  {swap.status === 'PENDING' && isSender && (
                    <span className="text-xs text-amber-400 flex items-center gap-1 font-medium">
                      <Clock className="w-3.5 h-3.5" /> Waiting for partner acceptance
                    </span>
                  )}

                  {swap.status === 'ACCEPTED' && (
                    <>
                      <Link
                        href={`/dashboard/chat?conversationId=${swap.conversation?.id}`}
                        className="px-3.5 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white hover:border-indigo-500 flex items-center gap-1.5"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-indigo-400" /> Open Chat
                      </Link>
                      <button
                        onClick={() => completeMutation.mutate(swap.id)}
                        className="btn-primary text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                      </button>
                    </>
                  )}

                  {swap.status === 'COMPLETED' && (
                    <Link
                      href="/dashboard/ratings"
                      className="px-3.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-300 border border-amber-500/20 text-xs font-semibold flex items-center gap-1"
                    >
                      <Star className="w-3.5 h-3.5 fill-amber-400" /> Submit Rating
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
