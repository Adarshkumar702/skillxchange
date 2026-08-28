'use client';

import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { useAuth } from '../../../lib/authContext';
import { Compass, Search, Star, Repeat, GraduationCap, CheckCircle, Zap, Shield, Share2, Copy, Check, UserCheck, HelpCircle, Eye, Github, Linkedin, X, Maximize2 } from 'lucide-react';

export default function DiscoverPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [minRatingFilter, setMinRatingFilter] = useState(0);
  const [onlyRealUsers, setOnlyRealUsers] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // View Public Student Profile Modal State
  const [viewStudentModal, setViewStudentModal] = useState<any>(null);
  const [showEnlargedPhoto, setShowEnlargedPhoto] = useState<string | null>(null);

  // Send Swap Request Modal State
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [offeredSkillId, setOfferedSkillId] = useState('');
  const [requestedSkillId, setRequestedSkillId] = useState('');
  const [message, setMessage] = useState('Hey! I noticed our skill compatibility and would love to exchange skills!');
  const [swapError, setSwapError] = useState('');
  const [swapSuccess, setSwapSuccess] = useState('');

  // Fetch Recommended Matches with Search & Filters
  const { data: matchesRes, isLoading } = useQuery({
    queryKey: ['recommendedMatches', searchQuery, universityFilter, minRatingFilter, onlyRealUsers],
    queryFn: () => {
      let query = '/matches/recommended?';
      if (searchQuery) query += `search=${encodeURIComponent(searchQuery)}&`;
      if (universityFilter) query += `university=${encodeURIComponent(universityFilter)}&`;
      if (minRatingFilter > 0) query += `minRating=${minRatingFilter}&`;
      if (onlyRealUsers) query += `onlyRealUsers=true&`;
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
              <Compass className="w-5 h-5 text-blue-500" /> AI Reciprocal Skill Swap Suggestions
            </h1>
            <p className="text-xs text-textMuted">
              Smart reciprocal matching pairs what you want to learn with peers who want to learn what you teach.
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
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-2">
          {/* Main Name / Email Search Input */}
          <div className="relative sm:col-span-2">
            <Search className="w-4 h-4 text-textMuted absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain focus:outline-none focus:border-slate-400"
              placeholder="Search by Name or Email (e.g. Adarsh, Sarah, Java, React)..."
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
              placeholder="Filter by University..."
            />
          </div>

          {/* User Type Toggle Filter */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyRealUsers(!onlyRealUsers)}
              className={`w-full py-2 px-3 rounded-lg border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                onlyRealUsers
                  ? 'bg-emerald-600 text-white border-emerald-500'
                  : 'bg-surface border-surfaceBorder text-textMuted hover:text-textMain'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              {onlyRealUsers ? 'Only Real Users' : 'All Profiles'}
            </button>
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
                {/* Header with Avatar & User Type Badge */}
                <div className="flex items-start justify-between">
                  <div
                    className="flex items-center gap-3.5 cursor-pointer group"
                    onClick={() => setViewStudentModal(match)}
                    title="Click to view full student profile"
                  >
                    <div className="relative">
                      <img
                        src={match.user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                        alt="Avatar"
                        className="w-14 h-14 rounded-2xl border-2 border-slate-300 dark:border-slate-700 shadow-md object-cover group-hover:scale-105 transition-transform"
                      />
                      <span className="w-3.5 h-3.5 bg-emerald-500 border-2 border-surface rounded-full absolute -bottom-1 -right-1" title="Online Student" />
                    </div>
                    <div>
                      <h3 className="text-sm font-extrabold text-textMain flex items-center gap-1.5 group-hover:text-blue-500 transition-colors">
                        {match.user.fullName} <Eye className="w-3.5 h-3.5 text-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
                      </h3>
                      <p className="text-[11px] text-textMuted flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> {match.user.university}
                      </p>
                      
                      {/* Real User vs Sample Demo Badge */}
                      {match.user.isRealUser ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3 text-emerald-500" /> Verified User
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full bg-slate-500/10 text-slate-500 dark:text-slate-400 border border-slate-500/20">
                          <HelpCircle className="w-3 h-3" /> Sample Profile
                        </span>
                      )}
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

              {/* Bottom Actions */}
              <div className="pt-4 border-t border-surfaceBorder flex items-center justify-between">
                <button
                  onClick={() => setViewStudentModal(match)}
                  className="text-xs text-textMuted hover:text-textMain font-semibold flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5 text-blue-500" /> View Profile
                </button>

                <button
                  onClick={() => {
                    setSelectedCandidate(match);
                    setOfferedSkillId(userTeachingSkills[0]?.skillId || '');
                    setRequestedSkillId(match.user.teachingSkills[0]?.id || '');
                  }}
                  className="btn-primary text-xs font-semibold px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" /> Quick Swap Request
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Public Student Profile Modal (Excludes Personal Contact Info: Phone, Email, Address) */}
      {viewStudentModal && (
        <div className="fixed inset-0 z-50 glass-panel bg-background/80 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder max-w-lg w-full space-y-5 shadow-2xl relative">
            <button
              onClick={() => setViewStudentModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg bg-surface border border-surfaceBorder text-textMuted hover:text-textMain"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Header */}
            <div className="flex items-center gap-4">
              <img
                src={viewStudentModal.user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                alt="Avatar"
                className="w-20 h-20 rounded-2xl border-2 border-blue-500 object-cover cursor-pointer hover:scale-105 transition-transform"
                onClick={() => setShowEnlargedPhoto(viewStudentModal.user.avatarUrl)}
                title="Click to view enlarged picture"
              />
              <div className="space-y-1">
                <h3 className="text-lg font-black text-textMain flex items-center gap-2">
                  {viewStudentModal.user.fullName}
                  {viewStudentModal.user.isRealUser ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                      ✓ Verified User
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
                      Sample Profile
                    </span>
                  )}
                </h3>
                <p className="text-xs text-textMuted flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> {viewStudentModal.user.university}
                </p>
                <p className="text-xs text-textMuted">{viewStudentModal.user.course} ('{viewStudentModal.user.graduationYear % 100})</p>
              </div>
            </div>

            {/* Bio */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-900 border border-surfaceBorder text-xs text-textMain leading-relaxed">
              {viewStudentModal.user.bio || 'This student has not added a detailed bio description yet.'}
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 gap-3 text-center text-xs">
              <div className="p-3 rounded-xl bg-surface border border-surfaceBorder">
                <span className="text-textMuted block text-[10px] uppercase font-bold">Reputation Score</span>
                <span className="text-sm font-black text-amber-500 flex items-center justify-center gap-1">
                  <Star className="w-4 h-4 fill-amber-400" /> {viewStudentModal.user.reputationScore}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-surface border border-surfaceBorder">
                <span className="text-textMuted block text-[10px] uppercase font-bold">Completed Exchanges</span>
                <span className="text-sm font-black text-blue-500">{viewStudentModal.user.completedExchanges || 0}</span>
              </div>
            </div>

            {/* Skills Lists */}
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-1.5">Teaches:</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewStudentModal.user.teachingSkills.map((sk: any) => (
                    <span key={sk.id} className="px-2.5 py-1 rounded-lg bg-slate-200 dark:bg-slate-800 text-textMain text-xs font-semibold">
                      {sk.name} <span className="text-[10px] text-blue-500">({sk.proficiency})</span>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-[11px] font-bold text-textMuted uppercase tracking-wider block mb-1.5">Wants to Learn:</span>
                <div className="flex flex-wrap gap-1.5">
                  {viewStudentModal.user.learningSkills.map((sk: any) => (
                    <span key={sk.id} className="px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-semibold">
                      {sk.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Links */}
            <div className="flex items-center gap-4 text-xs font-semibold pt-2 border-t border-surfaceBorder">
              {viewStudentModal.user.githubUrl && (
                <a href={viewStudentModal.user.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 hover:underline">
                  <Github className="w-3.5 h-3.5" /> GitHub Profile
                </a>
              )}
              {viewStudentModal.user.linkedinUrl && (
                <a href={viewStudentModal.user.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 hover:underline">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
            </div>

            {/* Action Footer */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setViewStudentModal(null)}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-textMuted hover:text-textMain"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedCandidate(viewStudentModal);
                  setOfferedSkillId(userTeachingSkills[0]?.skillId || '');
                  setRequestedSkillId(viewStudentModal.user.teachingSkills[0]?.id || '');
                  setViewStudentModal(null);
                }}
                className="btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" /> Send Swap Request
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enlarged Photo Lightbox Modal */}
      {showEnlargedPhoto && (
        <div className="fixed inset-0 z-50 glass-panel bg-background/90 flex items-center justify-center p-4">
          <div className="relative max-w-xl w-full flex flex-col items-center">
            <button
              onClick={() => setShowEnlargedPhoto(null)}
              className="absolute -top-12 right-0 p-2 rounded-full bg-surface border border-surfaceBorder text-textMain hover:bg-slate-800 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={showEnlargedPhoto}
              alt="Enlarged Profile Photo"
              className="max-h-[80vh] w-auto rounded-2xl border-2 border-blue-500 shadow-2xl object-contain bg-surface"
            />
          </div>
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
