'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { useAuth } from '../../../lib/authContext';
import { Compass, Search, Filter, Star, Repeat, GraduationCap, CheckCircle, MessageSquare } from 'lucide-react';

export default function DiscoverPage() {
  const { user } = useAuth();
  const [universityFilter, setUniversityFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState(0);

  // Send Swap Request Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [offeredSkillId, setOfferedSkillId] = useState('');
  const [requestedSkillId, setRequestedSkillId] = useState('');
  const [message, setMessage] = useState('Hey! I noticed our skill compatibility and would love to exchange skills!');
  const [swapError, setSwapError] = useState('');
  const [swapSuccess, setSwapSuccess] = useState('');

  // Fetch Recommended Matches
  const { data: matchesRes, isLoading } = useQuery({
    queryKey: ['recommendedMatches', universityFilter, minRatingFilter],
    queryFn: () => {
      let query = '/matches/recommended?';
      if (universityFilter) query += `university=${encodeURIComponent(universityFilter)}&`;
      if (minRatingFilter > 0) query += `minRating=${minRatingFilter}&`;
      return fetchApi(query);
    },
  });

  const matches = matchesRes?.data || [];

  // Create Swap Request Mutation
  const createSwapMutation = useMutation({
    mutationFn: (data: any) => fetchApi('/swaps', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: (res) => {
      if (res.success) {
        setSwapSuccess('Swap request sent successfully!');
        setSwapError('');
        setTimeout(() => {
          setSelectedCandidate(null);
          setSwapSuccess('');
        }, 1500);
      } else {
        setSwapError(res.message || 'Failed to send swap request');
      }
    },
  });

  const handleSendSwap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!offeredSkillId || !requestedSkillId || !selectedCandidate) return;
    createSwapMutation.mutate({
      receiverId: selectedCandidate.user.id,
      offeredSkillId,
      requestedSkillId,
      message,
    });
  };

  const userTeachingSkills = user?.skills?.filter((s: any) => s.type === 'TEACHING') || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
        <div>
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <Compass className="w-5 h-5 text-indigo-400" /> Discover Compatible Mentors & Swap Partners
          </h1>
          <p className="text-xs text-slate-400">
            Intelligent algorithm matches you with peers based on reciprocal teaching/learning overlap and university context.
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
              placeholder="Filter by University..."
            />
          </div>

          <div>
            <select
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
            >
              <option value={0}>All Ratings</option>
              <option value={4.5}>4.5★ and above</option>
              <option value={4.8}>4.8★ and above (Top Rated)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 rounded-xl space-y-4 animate-pulse">
              <div className="w-12 h-12 bg-surfaceBorder rounded-full" />
              <div className="h-4 bg-surfaceBorder rounded w-1/2" />
              <div className="h-3 bg-surfaceBorder rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Compass className="w-10 h-10 text-slate-500 mx-auto" />
          <h3 className="text-base font-bold text-white">No Compatible Candidates Found</h3>
          <p className="text-xs text-slate-400">Try adjusting your university filter or adding more skills to your profile.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match: any) => (
            <div key={match.user.id} className="glass-card p-6 rounded-2xl space-y-4 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <img
                      src={match.user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl border border-indigo-400"
                    />
                    <div>
                      <h3 className="text-sm font-bold text-white">{match.user.fullName}</h3>
                      <p className="text-xs text-slate-400 flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-indigo-400" /> {match.user.university}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm">
                    {match.compatibilityScore}% Match
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-surface border border-surfaceBorder space-y-1">
                    <span className="text-slate-400 text-[11px] font-semibold block uppercase">Teaches:</span>
                    <div className="flex flex-wrap gap-1">
                      {match.user.teachingSkills.map((sk: any) => (
                        <span key={sk.id} className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 text-[11px]">
                          {sk.name} ({sk.proficiency})
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-surface border border-surfaceBorder space-y-1">
                    <span className="text-slate-400 text-[11px] font-semibold block uppercase">Wants to Learn:</span>
                    <div className="flex flex-wrap gap-1">
                      {match.user.learningSkills.map((sk: any) => (
                        <span key={sk.id} className="px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 text-[11px]">
                          {sk.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] text-indigo-300 bg-indigo-950/40 p-2.5 rounded-lg border border-indigo-500/20">
                  💡 {match.explanations[0] || 'Matches your skill exchange goals.'}
                </div>
              </div>

              <div className="pt-4 border-t border-surfaceBorder flex items-center justify-between">
                <span className="text-xs text-amber-400 font-bold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {match.user.reputationScore}
                </span>

                <button
                  onClick={() => {
                    setSelectedCandidate(match);
                    setOfferedSkillId(userTeachingSkills[0]?.skillId || '');
                    setRequestedSkillId(match.user.teachingSkills[0]?.id || '');
                  }}
                  className="btn-primary text-xs font-semibold px-3.5 py-1.5 flex items-center gap-1.5"
                >
                  <Repeat className="w-3.5 h-3.5" /> Swap Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Send Swap Request Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 z-50 glass-panel bg-background/80 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder max-w-lg w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Send Swap Request to {selectedCandidate.user.fullName}
            </h3>

            {swapSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {swapSuccess}
              </div>
            )}

            {swapError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                {swapError}
              </div>
            )}

            <form onSubmit={handleSendSwap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Skill You Will Teach</label>
                <select
                  required
                  value={offeredSkillId}
                  onChange={(e) => setOfferedSkillId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                >
                  <option value="">-- Choose Your Teaching Skill --</option>
                  {userTeachingSkills.map((item: any) => (
                    <option key={item.skillId} value={item.skillId}>{item.skill.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Skill You Want to Learn</label>
                <select
                  required
                  value={requestedSkillId}
                  onChange={(e) => setRequestedSkillId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                >
                  <option value="">-- Choose Partner Teaching Skill --</option>
                  {selectedCandidate.user.teachingSkills.map((sk: any) => (
                    <option key={sk.id} value={sk.id}>{sk.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Personal Message</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-semibold px-4 py-2">
                  Send Swap Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
