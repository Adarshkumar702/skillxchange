'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { useAuth } from '../../../lib/authContext';
import { Compass, Search, Star, Repeat, GraduationCap, CheckCircle, Zap, Shield, Share2, Copy, Check } from 'lucide-react';

export default function DiscoverPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);

  // Send Swap Request Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [offeredSkillId, setOfferedSkillId] = useState('');
  const [requestedSkillId, setRequestedSkillId] = useState('');
  const [message, setMessage] = useState('Hey! I noticed our skill compatibility and would love to exchange skills!');
  const [swapError, setSwapError] = useState('');
  const [swapSuccess, setSwapSuccess] = useState('');

  // Fetch Recommended Matches with Search & Filters
  const { data: matchesRes, isLoading } = useQuery({
    queryKey: ['recommendedMatches', searchQuery, universityFilter, minRatingFilter],
    queryFn: () => {
      let query = '/matches/recommended?';
      if (searchQuery) query += `search=${encodeURIComponent(searchQuery)}&`;
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

  const handleCopyProfileLink = () => {
    const link = `${window.location.origin}/dashboard/discover?search=${encodeURIComponent(user?.profile?.fullName || '')}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const userTeachingSkills = user?.skills?.filter((s: any) => s.type === 'TEACHING') || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-textMain flex items-center gap-2">
              <Compass className="w-5 h-5 text-blue-500" /> Discover Mentors & Friends
            </h1>
            <p className="text-xs text-textMuted">
              Search peers by Name, Email, or University and send instant skill swap requests.
            </p>
          </div>

          <button
            onClick={handleCopyProfileLink}
            className="btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 self-start sm:self-auto"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            {copiedLink ? 'Link Copied!' : 'Share My Profile Link'}
          </button>
        </div>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          {/* Main Name / Email Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-textMuted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain focus:outline-none focus:border-slate-400"
              placeholder="Search by Name or Email (e.g. Alex, Sarah)..."
            />
          </div>

          {/* University Filter */}
          <div className="relative">
            <GraduationCap className="w-4 h-4 text-textMuted absolute left-3 top-2.5" />
            <input
              type="text"
              value={universityFilter}
              onChange={(e) => setUniversityFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain focus:outline-none focus:border-slate-400"
              placeholder="Filter by University (e.g. Stanford)..."
            />
          </div>

          {/* Rating Filter */}
          <div>
            <select
              value={minRatingFilter}
              onChange={(e) => setMinRatingFilter(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain focus:outline-none focus:border-slate-400"
            >
              <option value={0}>All Peer Ratings</option>
              <option value={4.5}>4.5★ and above</option>
              <option value={4.8}>4.8★ and above (Top Mentors)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Candidate Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card p-6 rounded-2xl space-y-4 animate-pulse">
              <div className="w-14 h-14 bg-surfaceBorder rounded-2xl" />
              <div className="h-4 bg-surfaceBorder rounded w-1/2" />
              <div className="h-3 bg-surfaceBorder rounded w-3/4" />
            </div>
          ))}
        </div>
      ) : matches.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-3">
          <Compass className="w-10 h-10 text-textMuted mx-auto" />
          <h3 className="text-base font-bold text-textMain">No Peers Found</h3>
          <p className="text-xs text-textMuted">No user matched your search term "{searchQuery}". Try searching by a different name or email.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {matches.map((match: any) => (
            <div key={match.user.id} className="glass-card p-6 rounded-2xl space-y-5 flex flex-col justify-between relative overflow-hidden">
              <div className="space-y-4">
                {/* Header with Avatar & Badge */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3.5">
                    <div className="relative">
                      <img
                        src={match.user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                        alt="Avatar"
                        className="w-14 h-14 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-md object-cover"
                      />
                      <span className="w-3.5 h-3.5 bg-emerald-500 border-2 border-surface rounded-full absolute -bottom-1 -right-1" title="Online Student" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-textMain flex items-center gap-1.5">
                        {match.user.fullName}
                      </h3>
                      <p className="text-[11px] text-textMuted flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> {match.user.university}
                      </p>
                      <p className="text-[10px] text-textMuted">{match.user.course} ('{match.user.graduationYear % 100})</p>
                    </div>
                  </div>

                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-sm">
                    {match.compatibilityScore}%
                  </span>
                </div>

                {/* Skills Showcase */}
                <div className="space-y-2.5 text-xs">
                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-surfaceBorder space-y-1.5">
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Teaches:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {match.user.teachingSkills.map((sk: any) => (
                        <span key={sk.id} className="px-2.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-textMain text-[11px] font-semibold">
                          {sk.name} <span className="text-[9px] opacity-70">({sk.proficiency})</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-surfaceBorder space-y-1.5">
                    <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block">Wants to Learn:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {match.user.learningSkills.map((sk: any) => (
                        <span key={sk.id} className="px-2.5 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[11px] font-semibold">
                          {sk.name}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Match Explanations Callout */}
                <div className="text-[11px] text-textMain bg-slate-100 dark:bg-slate-900/60 p-3 rounded-xl border border-surfaceBorder leading-relaxed">
                  💡 {match.explanations[0] || 'Matches your skill exchange goals.'}
                </div>
              </div>

              {/* Bottom Quick Swap Button */}
              <div className="pt-4 border-t border-surfaceBorder flex items-center justify-between">
                <span className="text-xs text-amber-500 font-extrabold flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-400" /> {match.user.reputationScore}
                </span>

                <button
                  onClick={() => {
                    setSelectedCandidate(match);
                    setOfferedSkillId(userTeachingSkills[0]?.skillId || '');
                    setRequestedSkillId(match.user.teachingSkills[0]?.id || '');
                  }}
                  className="btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Quick Swap Request
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
            <h3 className="text-base font-bold text-textMain">
              Send Swap Request to {selectedCandidate.user.fullName}
            </h3>

            {swapSuccess && (
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> {swapSuccess}
              </div>
            )}

            {swapError && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs">
                {swapError}
              </div>
            )}

            <form onSubmit={handleSendSwap} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textMuted mb-1">Skill You Will Teach</label>
                <select
                  required
                  value={offeredSkillId}
                  onChange={(e) => setOfferedSkillId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                >
                  <option value="">-- Choose Your Teaching Skill --</option>
                  {userTeachingSkills.map((item: any) => (
                    <option key={item.skillId} value={item.skillId}>{item.skill.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMuted mb-1">Skill You Want to Learn</label>
                <select
                  required
                  value={requestedSkillId}
                  onChange={(e) => setRequestedSkillId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                >
                  <option value="">-- Choose Partner Teaching Skill --</option>
                  {selectedCandidate.user.teachingSkills.map((sk: any) => (
                    <option key={sk.id} value={sk.id}>{sk.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMuted mb-1">Personal Message</label>
                <textarea
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-textMuted hover:text-textMain"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-semibold px-4 py-2">
                  Send Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
