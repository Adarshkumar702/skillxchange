'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { useAuth } from '../../../lib/authContext';
import { Calendar, Plus, Video, Clock, CheckCircle, ExternalLink, X, ShieldCheck } from 'lucide-react';

export default function SessionsPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [swapRequestId, setSwapRequestId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [customMeetingUrl, setCustomMeetingUrl] = useState('');

  // Embedded Video Call Modal State
  const [activeVideoCall, setActiveVideoCall] = useState<any>(null);

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
      setCustomMeetingUrl('');
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
      meetingUrl: customMeetingUrl || undefined,
    });
  };

  const getCleanVideoUrl = (rawUrl: string) => {
    if (!rawUrl) return '';
    const displayName = encodeURIComponent(user?.profile?.fullName || 'Student');
    if (rawUrl.includes('meet.jit.si')) {
      // Append config to bypass lobby & prejoin and pass user display name directly
      const baseUrl = rawUrl.split('#')[0];
      return `${baseUrl}#userInfo.displayName="${displayName}"&config.prejoinPageEnabled=false&config.enableLobby=false&config.startWithAudioMuted=false&config.disableDeepLinking=true`;
    }
    return rawUrl;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-textMain flex items-center gap-2">
            <Calendar className="w-5 h-5 text-emerald-500" /> 1-on-1 Live Video Teaching Sessions
          </h1>
          <p className="text-xs text-textMuted">
            Instant HD video rooms with live screen sharing. No lobby or password required.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs font-semibold px-4 py-2.5 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Schedule New Video Session
        </button>
      </div>

      {/* Sessions Grid */}
      {isLoading ? (
        <p className="text-xs text-textMuted">Loading sessions...</p>
      ) : sessions.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Video className="w-10 h-10 text-textMuted mx-auto" />
          <h3 className="text-base font-bold text-textMain">No Scheduled Video Sessions</h3>
          <p className="text-xs text-textMuted">Schedule your first 1-on-1 live video call for an active skill exchange.</p>
          <button onClick={() => setShowModal(true)} className="btn-primary inline-block text-xs">
            + Schedule Session Now
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((sess: any) => (
            <div key={sess.id} className="glass-card p-6 rounded-2xl border border-surfaceBorder space-y-5 flex flex-col justify-between shadow-md">
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-sm font-extrabold text-textMain flex items-center gap-2">
                    <Video className="w-4 h-4 text-blue-500" /> {sess.title}
                  </h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                    sess.status === 'COMPLETED'
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20'
                  }`}>
                    {sess.status}
                  </span>
                </div>

                <p className="text-xs font-medium text-textMain leading-relaxed">
                  {sess.description || 'Live coding walkthrough, topic explanation, and Q&A session.'}
                </p>

                <div className="space-y-1.5 text-xs text-textMuted">
                  <p className="flex items-center gap-1.5 font-medium">
                    <Clock className="w-3.5 h-3.5 text-blue-500" />
                    {new Date(sess.scheduledAt).toLocaleString()} ({sess.durationMinutes} mins)
                  </p>
                  <p className="flex items-center gap-1.5 text-[11px] text-emerald-500 font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" /> Instant Open Access (No Moderator Lock)
                  </p>
                </div>
              </div>

              {/* Video Call Action Bar */}
              <div className="pt-4 border-t border-surfaceBorder flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                {sess.meetingUrl ? (
                  <div className="flex items-center gap-2">
                    {/* In-App Embedded Video Call Button */}
                    <button
                      onClick={() => setActiveVideoCall(sess)}
                      className="btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-2 justify-center shadow-md"
                    >
                      <Video className="w-4 h-4 text-emerald-400" /> Join Instant Video Call
                    </button>

                    {/* External Link Option */}
                    <a
                      href={getCleanVideoUrl(sess.meetingUrl)}
                      target="_blank"
                      rel="noreferrer"
                      className="p-2 rounded-lg bg-surface border border-surfaceBorder text-textMuted hover:text-textMain transition-colors"
                      title="Open in new browser tab (Google Meet / Zoom / Jitsi)"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                ) : (
                  <span className="text-xs text-textMuted">No video URL attached</span>
                )}

                {sess.status === 'SCHEDULED' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: sess.id, status: 'COMPLETED' })}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-surfaceBorder text-xs font-semibold text-textMuted hover:text-textMain flex items-center gap-1 justify-center"
                  >
                    <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Mark Completed
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Embedded Live Video Call Room Modal (Instant Entrance without Lobby) */}
      {activeVideoCall && (
        <div className="fixed inset-0 z-50 glass-panel bg-background/95 flex flex-col p-4 animate-in fade-in">
          {/* Top Video Header */}
          <div className="glass-panel p-3 rounded-xl border border-surfaceBorder flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <h3 className="text-sm font-extrabold text-textMain flex items-center gap-2">
                  <Video className="w-4 h-4 text-emerald-500" /> {activeVideoCall.title} (Live Session)
                </h3>
                <p className="text-[11px] text-textMuted">
                  Student: {user?.profile?.fullName || 'User'} • Open Access (No Moderator Approval Required)
                </p>
              </div>
            </div>

            <button
              onClick={() => setActiveVideoCall(null)}
              className="px-4 py-2 rounded-lg bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20 text-xs font-semibold flex items-center gap-1.5 hover:bg-red-500/20 transition-colors"
            >
              <X className="w-4 h-4" /> Leave Video Call
            </button>
          </div>

          {/* Embedded WebRTC Video Iframe */}
          <div className="flex-1 rounded-2xl overflow-hidden border border-surfaceBorder bg-black shadow-2xl relative">
            <iframe
              src={getCleanVideoUrl(activeVideoCall.meetingUrl)}
              allow="camera; microphone; display-capture; autoplay; clipboard-write"
              className="w-full h-full border-none"
              title="Live SkillXchange Video Teaching Room"
            />
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 glass-panel bg-background/80 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-textMain flex items-center gap-2">
              <Video className="w-5 h-5 text-blue-500" /> Schedule Video Teaching Session
            </h3>

            <form onSubmit={handleCreateSession} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textMuted mb-1">Select Skill Exchange Partner</label>
                <select
                  required
                  value={swapRequestId}
                  onChange={(e) => setSwapRequestId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                >
                  <option value="">-- Select Active Swap --</option>
                  {activeSwaps.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.offeredSkill.name} ↔ {s.requestedSkill.name} ({s.sender.profile?.fullName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMuted mb-1">Session Topic Title</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                  placeholder="e.g. React Hooks Live Code Walkthrough"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMuted mb-1">Topic Description / Agenda</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                  placeholder="What will you teach or learn in this call?"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMuted mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMuted mb-1">
                  Custom Meeting URL (Optional - Google Meet / Zoom link)
                </label>
                <input
                  type="url"
                  value={customMeetingUrl}
                  onChange={(e) => setCustomMeetingUrl(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                  placeholder="https://meet.google.com/abc-defg-hij or leave blank for instant room"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-textMuted hover:text-textMain"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-semibold px-4 py-2">
                  Create Session
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
