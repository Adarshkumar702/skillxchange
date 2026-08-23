'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { Calendar, Plus, Video, Clock, CheckCircle, XCircle } from 'lucide-react';

export default function SessionsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [swapRequestId, setSwapRequestId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);

  // Fetch user sessions
  const { data: sessionsRes, isLoading } = useQuery({
    queryKey: ['learningSessions'],
    queryFn: () => fetchApi('/sessions'),
  });

  // Fetch active swaps to pick swapRequestId
  const { data: swapsRes } = useQuery({
    queryKey: ['activeSwapsForSessions'],
    queryFn: () => fetchApi('/swaps?status=ACCEPTED'),
  });

  const sessions = sessionsRes?.data || [];
  const activeSwaps = swapsRes?.data || [];

  // Create session mutation
  const createSessionMutation = useMutation({
    mutationFn: (data: any) => fetchApi('/sessions', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['learningSessions'] });
      setShowModal(false);
      setTitle('');
    },
  });

  // Complete session mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      fetchApi(`/sessions/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learningSessions'] }),
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapRequestId || !title || !scheduledAt) return;
    createSessionMutation.mutate({
      swapRequestId,
      title,
      description,
      scheduledAt: new Date(scheduledAt).toISOString(),
      durationMinutes: Number(durationMinutes),
    });
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-400" /> Learning Sessions Scheduler
          </h1>
          <p className="text-xs text-slate-400">Schedule 1-on-1 video calls, cover syllabus topics, and mark completed milestones.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Schedule Session
        </button>
      </div>

      {/* Sessions Grid */}
      {isLoading ? (
        <p className="text-xs text-slate-400">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Calendar className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Scheduled Sessions</h3>
          <p className="text-xs text-slate-400">Schedule your first 1-on-1 learning session for active exchanges.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((sess: any) => (
            <div key={sess.id} className="glass-card p-6 rounded-2xl border border-surfaceBorder space-y-4 flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-bold text-white">{sess.title}</h3>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                    sess.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                  }`}>
                    {sess.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300">
                  {sess.description || 'Topic breakdown & live code review session.'}
                </p>

                <div className="space-y-1 text-xs text-slate-400">
                  <p className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {new Date(sess.scheduledAt).toLocaleString()} ({sess.durationMinutes} mins)
                  </p>
                  {sess.meetingUrl && (
                    <a
                      href={sess.meetingUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-cyan-400 font-semibold hover:underline pt-1"
                    >
                      <Video className="w-4 h-4 text-cyan-400" /> Join Jitsi Video Room
                    </a>
                  )}
                </div>
              </div>

              {sess.status === 'SCHEDULED' && (
                <div className="pt-4 border-t border-surfaceBorder flex justify-end gap-2">
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: sess.id, status: 'COMPLETED' })}
                    className="btn-primary text-xs font-semibold px-3 py-1.5 flex items-center gap-1"
                  >
                    <CheckCircle className="w-3.5 h-3.5" /> Mark Completed
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 glass-panel bg-background/80 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Schedule Learning Session</h3>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Exchange</label>
                <select
                  required
                  value={swapRequestId}
                  onChange={(e) => setSwapRequestId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                >
                  <option value="">-- Select Active Swap --</option>
                  {activeSwaps.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.offeredSkill.name} ↔ {s.requestedSkill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Session Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                  placeholder="e.g. React Hooks Deep Dive"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-semibold px-4 py-2">
                  Confirm Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
