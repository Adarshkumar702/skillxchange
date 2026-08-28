'use client';

import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { useAuth } from '../../../lib/authContext';
import {
  Compass,
  Search,
  Star,
  GraduationCap,
  Sparkles,
  CheckCircle,
  HelpCircle,
  UserCheck,
  Eye,
  X,
  Send,
  Github,
  Linkedin,
  Share2,
  UserX,
  AlertTriangle,
} from 'lucide-react';

export default function DiscoverPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [universityFilter, setUniversityFilter] = useState('');
  const [onlyRealUsers, setOnlyRealUsers] = useState(false);
  const [selectedCandidate, setSelectedCandidate] = useState<any>(null);
  const [viewStudentModal, setViewStudentModal] = useState<any>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([]);

  const [offeredSkillId, setOfferedSkillId] = useState('');
  const [requestedSkillId, setRequestedSkillId] = useState('');
  const [swapSending, setSwapSending] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState('');
  const [swapError, setSwapError] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Load deleted user IDs from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('skillxchange_deleted_users');
        if (stored) {
          setDeletedUserIds(JSON.parse(stored));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Helper to check if a user is removed by Admin
  const checkIsRemovedByAdmin = (u: any) => {
    if (!u) return false;
    return (
      u.isDeleted === true ||
      deletedUserIds.includes(u.id) ||
      deletedUserIds.includes(u.email) ||
      deletedUserIds.includes(u.fullName)
    );
  };

  // Helper to reliably classify Verified User vs Sample Profile
  const isUserVerified = (u: any) => {
    if (!u) return false;
    if (u.isRealUser === true || u.userBadge === 'VERIFIED_STUDENT' || u.isVerified === true) return true;
    const pureSampleNames = ['Alex Morgan', 'Sarah Chen', 'David Kumar'];
    if (!pureSampleNames.includes(u.fullName)) return true;
    return false;
  };

  // Fetch Recommended Matches
  const { data: matchesRes, isLoading } = useQuery({
    queryKey: ['discoverMatches', universityFilter, searchQuery, onlyRealUsers],
    queryFn: () =>
      fetchApi(
        `/matches/recommended?university=${encodeURIComponent(universityFilter)}&search=${encodeURIComponent(
          searchQuery
        )}&onlyRealUsers=${onlyRealUsers}`
      ),
  });

  const matches = matchesRes?.data || [];

  const handleSendSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCandidate || !offeredSkillId || !requestedSkillId) return;

    if (checkIsRemovedByAdmin(selectedCandidate.user)) {
      setSwapError('Cannot send swap request: This account was removed by the Admin.');
      return;
    }

    setSwapSending(true);
    setSwapError('');
    setSwapSuccess('');

    const res = await fetchApi('/swaps', {
      method: 'POST',
      body: JSON.stringify({
        receiverId: selectedCandidate.user.id,
        offeredSkillId,
        requestedSkillId,
        notes: `Skill Swap Request from ${user?.profile?.fullName || 'peer'}`,
      }),
    });

    setSwapSending(false);

    if (res.success) {
      setSwapSuccess('Skill Swap request sent successfully!');
      setTimeout(() => {
        setSelectedCandidate(null);
        setSwapSuccess('');
      }, 2000);
    } else {
      setSwapError(res.message || 'Failed to send swap request');
    }
  };

  const handleShareProfileLink = () => {
    if (typeof window !== 'undefined') {
      const shareUrl = `${window.location.origin}/dashboard/discover`;
      navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const userTeachingSkills = user?.skills?.filter((s: any) => s.type === 'TEACHING') || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-indigo-400 text-xs font-semibold mb-1">
              <Sparkles className="w-3.5 h-3.5" /> AI Reciprocal Engine
            </div>
            <h1 className="text-2xl font-extrabold text-textMain flex items-center gap-2">
              <Compass className="w-6 h-6 text-blue-500" /> Discover Peers & Mentors
            </h1>
            <p className="text-xs text-textMuted">
              AI computes exact reciprocal skill matches (e.g. Java, C++ ↔ React, TypeScript) across registered peers.
            </p>
          </div>

          <button
            onClick={handleShareProfileLink}
            className="px-3.5 py-2 rounded-xl bg-surface border border-surfaceBorder text-xs font-bold text-textMain hover:border-blue-500 transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Share2 className="w-4 h-4 text-blue-500" />
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
              placeholder="Search by Name or Email (e.g. Adarsh, Deep, Sardar, Java, React)..."
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
          {matches.map((match: any) => {
            const verified = isUserVerified(match.user);
            const isRemoved = checkIsRemovedByAdmin(match.user);

            return (
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
                        <span className={`w-3.5 h-3.5 border-2 border-surface rounded-full absolute -bottom-1 -right-1 ${isRemoved ? 'bg-red-500' : 'bg-emerald-500'}`} />
                      </div>
                      <div>
                        <h3 className="text-sm font-extrabold text-textMain flex items-center gap-1.5 group-hover:text-blue-500 transition-colors">
                          {match.user.fullName} <Eye className="w-3.5 h-3.5 text-textMuted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </h3>
                        <p className="text-[11px] text-textMuted flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-blue-500" /> {match.user.university}
                        </p>
                        
                        {/* Real User vs Sample Demo vs Removed Badge */}
                        {isRemoved ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 mt-1 rounded-full bg-red-500/10 text-red-500 border border-red-500/30">
                            <UserX className="w-3 h-3 text-red-500" /> Removed by Admin
                          </span>
                        ) : verified ? (
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

                {/* Footer Buttons */}
                <div className="pt-4 border-t border-surfaceBorder flex items-center justify-between gap-2">
                  <button
                    onClick={() => setViewStudentModal(match)}
                    className="text-xs font-semibold text-textMuted hover:text-blue-500 transition-colors flex items-center gap-1"
                  >
                    <Eye className="w-3.5 h-3.5" /> View Profile
                  </button>

                  <button
                    disabled={isRemoved}
                    onClick={() => {
                      setSelectedCandidate(match);
                      setOfferedSkillId(userTeachingSkills[0]?.skillId || '');
                      setRequestedSkillId(match.user.teachingSkills[0]?.id || '');
                    }}
                    className="btn-primary text-xs font-semibold py-2 px-3.5 flex items-center gap-1.5 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="w-3.5 h-3.5" /> {isRemoved ? 'Removed' : 'Quick Swap Request'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Public Student Profile Modal */}
      {viewStudentModal && (() => {
        const isRemovedByAdmin = checkIsRemovedByAdmin(viewStudentModal.user);
        return (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder max-w-lg w-full space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
              <button
                onClick={() => setViewStudentModal(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg bg-surface border border-surfaceBorder text-textMuted hover:text-textMain"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Profile Avatar Header & Image Lightbox Trigger */}
              <div className="flex items-center gap-4 border-b border-surfaceBorder pb-4">
                <div
                  className="relative cursor-pointer group"
                  onClick={() => setLightboxImage(viewStudentModal.user.avatarUrl)}
                  title="Click image to zoom full preview"
                >
                  <img
                    src={viewStudentModal.user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                    alt="Avatar"
                    className="w-16 h-16 rounded-2xl border-2 border-blue-500 object-cover shadow-lg group-hover:scale-105 transition-transform"
                  />
                  <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Eye className="w-4 h-4 text-white" />
                  </div>
                </div>

                <div>
                  <h3 className="text-base font-extrabold text-textMain flex items-center gap-2">
                    {viewStudentModal.user.fullName}
                    {isRemovedByAdmin ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 flex items-center gap-1">
                        <UserX className="w-3 h-3 text-red-500" /> Account Removed by Admin
                      </span>
                    ) : isUserVerified(viewStudentModal.user) ? (
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

              {/* Admin Removal Alert Banner */}
              {isRemovedByAdmin && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                  <span>This user account has been removed by the Admin / Project Owner. Skill swap requests are disabled.</span>
                </div>
              )}

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
                  disabled={isRemovedByAdmin}
                  onClick={() => {
                    setSelectedCandidate(viewStudentModal);
                    setOfferedSkillId(userTeachingSkills[0]?.skillId || '');
                    setRequestedSkillId(viewStudentModal.user.teachingSkills[0]?.id || '');
                    setViewStudentModal(null);
                  }}
                  className="btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <Send className="w-3.5 h-3.5" /> {isRemovedByAdmin ? 'Account Removed by Admin' : 'Send Swap Request'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Profile Photo Lightbox Preview */}
      {lightboxImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setLightboxImage(null)}
        >
          <div className="relative max-w-xl max-h-[80vh] flex flex-col items-center gap-3">
            <img
              src={lightboxImage}
              alt="Profile Lightbox"
              className="max-w-full max-h-[70vh] rounded-2xl shadow-2xl border-4 border-slate-700 object-contain bg-slate-900"
            />
            <p className="text-xs font-semibold text-slate-400">Click anywhere to close full photo preview</p>
          </div>
        </div>
      )}

      {/* Quick Swap Request Modal */}
      {selectedCandidate && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
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
                  <option value="">-- Choose Partner's Skill --</option>
                  {selectedCandidate.user.teachingSkills.map((sk: any) => (
                    <option key={sk.id} value={sk.id}>{sk.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCandidate(null)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-textMuted hover:text-textMain"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={swapSending}
                  className="btn-primary text-xs font-semibold px-4 py-2"
                >
                  {swapSending ? 'Sending Request...' : 'Send Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
