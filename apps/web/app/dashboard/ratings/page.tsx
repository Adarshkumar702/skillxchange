'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { Star, Plus, CheckCircle } from 'lucide-react';

export default function RatingsPage() {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [swapRequestId, setSwapRequestId] = useState('');
  const [rateeId, setRateeId] = useState('');
  const [overall, setOverall] = useState(5);
  const [teachingQuality, setTeachingQuality] = useState(5);
  const [communication, setCommunication] = useState(5);
  const [reliability, setReliability] = useState(5);
  const [knowledge, setKnowledge] = useState(5);
  const [feedback, setFeedback] = useState('');

  // Fetch completed swaps to rate
  const { data: swapsRes } = useQuery({
    queryKey: ['completedSwapsForRating'],
    queryFn: () => fetchApi('/swaps?status=COMPLETED'),
  });

  // Fetch my received ratings
  const { data: ratingsRes, isLoading } = useQuery({
    queryKey: ['myRatings'],
    queryFn: () => fetchApi('/ratings/my'),
  });

  const completedSwaps = swapsRes?.data || [];
  const ratings = ratingsRes?.data || [];

  // Create rating mutation
  const createRatingMutation = useMutation({
    mutationFn: (data: any) => fetchApi('/ratings', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myRatings'] });
      setShowModal(false);
      setFeedback('');
    },
  });

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    if (!swapRequestId || !rateeId) return;
    createRatingMutation.mutate({
      swapRequestId,
      rateeId,
      overall,
      teachingQuality,
      communication,
      reliability,
      knowledge,
      feedback,
    });
  };

  return (
    <div className="space-y-8">
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Star className="w-5 h-5 text-amber-400 fill-amber-400" /> Peer Ratings & Reviews
          </h1>
          <p className="text-xs text-slate-400">Rate your exchange partners across teaching quality, communication, and reliability.</p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Submit Review
        </button>
      </div>

      {isLoading ? (
        <p className="text-xs text-slate-400">Loading reviews...</p>
      ) : ratings.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Star className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Received Ratings Yet</h3>
          <p className="text-xs text-slate-400">Complete skill exchanges to earn 5-star ratings and boost your profile reputation score.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {ratings.map((r: any) => (
            <div key={r.id} className="glass-card p-6 rounded-2xl border border-surfaceBorder space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={r.rater.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full border border-indigo-400"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-white">{r.rater.profile?.fullName}</h4>
                    <p className="text-[10px] text-slate-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="text-sm font-extrabold text-amber-400 flex items-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400" /> {r.overall} / 5.0
                </span>
              </div>

              <p className="text-xs text-slate-300 bg-surface p-3 rounded-lg border border-surfaceBorder">
                "{r.feedback || 'Great learning experience and clear explanation!'}"
              </p>

              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-400 pt-1">
                <div>Teaching: <strong className="text-white">{r.teachingQuality}★</strong></div>
                <div>Communication: <strong className="text-white">{r.communication}★</strong></div>
                <div>Reliability: <strong className="text-white">{r.reliability}★</strong></div>
                <div>Knowledge: <strong className="text-white">{r.knowledge}★</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Rating Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 glass-panel bg-background/80 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">Rate Exchange Partner</h3>

            <form onSubmit={handleSubmitRating} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Completed Exchange</label>
                <select
                  required
                  value={swapRequestId}
                  onChange={(e) => {
                    setSwapRequestId(e.target.value);
                    const selected = completedSwaps.find((s: any) => s.id === e.target.value);
                    if (selected) setRateeId(selected.receiverId);
                  }}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                >
                  <option value="">-- Choose Completed Exchange --</option>
                  {completedSwaps.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.offeredSkill.name} ↔ {s.requestedSkill.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Overall Rating (1 - 5 Stars)</label>
                <input
                  type="number"
                  min={1}
                  max={5}
                  value={overall}
                  onChange={(e) => setOverall(Number(e.target.value))}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Review Feedback</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                  placeholder="Share details about teaching style and communication..."
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
                  Submit Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
