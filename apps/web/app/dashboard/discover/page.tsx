'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import {
  Search,
  Sparkles,
  UserCheck,
  Star,
  Send,
  SlidersHorizontal,
  CheckCircle,
  GraduationCap,
  AlertCircle,
  AlertTriangle,
  UserX,
  X,
} from 'lucide-react';

export default function DiscoverPage() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [minMatchScore, setMinMatchScore] = useState<number>(0);
  const [swapSuccessMsg, setSwapSuccessMsg] = useState<string>('');
  const [swapErrorMsg, setSwapErrorMsg] = useState<string>('');
  const [viewStudentModal, setViewStudentModal] = useState<any>(null);

  // Track deleted user identifiers to mark purged users
  const [deletedUserSet, setDeletedUserSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('skillxchange_deleted_users');
        if (stored) {
          const arr: string[] = JSON.parse(stored);
          setDeletedUserSet(new Set(arr.map((s) => String(s).toLowerCase().trim())));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const checkIsRemovedByAdmin = (studentUser: any) => {
    if (!studentUser) return false;
    const name = (studentUser.fullName || studentUser.profile?.fullName || '').toLowerCase().trim();
    const email = (studentUser.email || '').toLowerCase().trim();
    const id = (studentUser.id || '').toLowerCase().trim();

    return deletedUserSet.has(name) || deletedUserSet.has(email) || deletedUserSet.has(id);
  };

  // Registered real users list (VERIFIED)
  const registeredUserIdentifiers = new Set([
    'hardik pandya', 'deep', 'sardar', 'adarsh', 'adarsh kumar',
    'usr_hardik_903f2c', 'usr_deep_712e4b', 'usr_sardar_441a9d',
    'hardik@paruluniversity.edu', 'hardik@student.edu', 'deep@stanford.edu', 'sardar@stanford.edu', 'admin@adarsh.com'
  ]);

  // Seed sample profiles list (SAMPLE PROFILE)
  const seedSampleIdentifiers = new Set([
    'sarah chen', 'alex morgan', 'david kumar',
    'usr_sarah_119d6c', 'usr_alex_332b8e', 'usr_david_445c9a',
    'sarah.chen@stanford.edu', 'alex.morgan@stanford.edu', 'alex@example.com', 'sarah@example.com', 'david@example.com', 'david.kumar@example.com'
  ]);

  const isUserVerified = (usr: any) => {
    if (!usr) return false;
    const name = (usr.fullName || usr.profile?.fullName || '').toLowerCase().trim();
    const email = (usr.email || '').toLowerCase().trim();
    const id = (usr.id || '').toLowerCase().trim();

    // Explicit seed sample accounts are ALWAYS Sample Profile
    if (seedSampleIdentifiers.has(name) || seedSampleIdentifiers.has(email) || seedSampleIdentifiers.has(id)) {
      return false;
    }

    // Explicit registered real users (Hardik, Deep, Sardar, Adarsh, etc.)
    if (registeredUserIdentifiers.has(name) || registeredUserIdentifiers.has(email) || registeredUserIdentifiers.has(id)) {
      return true;
    }

    // Any registered real user
    return usr.isVerified === true || usr.userBadge === 'VERIFIED' || usr.isRealUser === true;
  };

  // Fetch Recommended Reciprocal Matches
  const { data: matchesRes, isLoading: isLoadingMatches } = useQuery({
    queryKey: ['recommendedMatches', selectedCategory, searchQuery],
    queryFn: () => {
      let url = '/matches/recommended';
      const params = new URLSearchParams();
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (searchQuery) params.append('query', searchQuery);
      if (params.toString()) url += `?${params.toString()}`;
      return fetchApi(url);
    },
  });

  // Fetch Skill Categories
  const { data: categoriesRes } = useQuery({
    queryKey: ['skillCategories'],
    queryFn: () => fetchApi('/skills/categories'),
  });

  // Send Swap Request Mutation
  const sendSwapMutation = useMutation({
    mutationFn: (data: { receiverId: string; offeredSkillId: string; requestedSkillId: string; message?: string }) =>
      fetchApi('/swaps', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: () => {
      setSwapSuccessMsg('Swap request sent successfully! You can track status under "My Swaps".');
      setSwapErrorMsg('');
      setViewStudentModal(null);
      setTimeout(() => setSwapSuccessMsg(''), 5000);
      queryClient.invalidateQueries({ queryKey: ['userSwaps'] });
    },
    onError: (err: any) => {
      setSwapErrorMsg(err.message || 'Failed to send swap request.');
      setSwapSuccessMsg('');
    },
  });

  const matches = matchesRes?.data || [];
  const categories = categoriesRes?.data || [];

  // Default Candidates Fallback for Discover Matches Section
  const defaultMatches = [
    {
      user: {
        id: 'usr_hardik_903f2c',
        fullName: 'Hardik Pandya',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Hardik',
        university: 'Parul University',
        course: 'Computer Science',
        graduationYear: 2026,
        reputationScore: 4.95,
        completedExchanges: 18,
        isVerified: true,
        isRealUser: true,
        userBadge: 'VERIFIED',
        bio: 'Competitive Programmer & Full Stack developer.',
        teachingSkills: [{ id: 'sk_dsa_404', name: 'Data Structures & C++', proficiency: 'Advanced' }],
        learningSkills: [{ id: 'sk_sys_505', name: 'System Design', proficiency: 'Intermediate' }],
      },
      matchScore: 98,
      compatibilityScore: 98,
    },
    {
      user: {
        id: 'usr_deep_712e4b',
        fullName: 'Deep',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Deep',
        university: 'Stanford University',
        course: 'Computer Science',
        graduationYear: 2026,
        reputationScore: 4.75,
        completedExchanges: 8,
        isVerified: true,
        isRealUser: true,
        userBadge: 'VERIFIED',
        bio: 'Backend Specialist in Node.js, Express, and PostgreSQL.',
        teachingSkills: [{ id: 'sk_node_606', name: 'Node.js & Postgres', proficiency: 'Advanced' }],
        learningSkills: [{ id: 'sk_ui_707', name: 'UI/UX Design', proficiency: 'Beginner' }],
      },
      matchScore: 95,
      compatibilityScore: 95,
    },
    {
      user: {
        id: 'usr_sardar_441a9d',
        fullName: 'Sardar',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sardar',
        university: 'Stanford University',
        course: 'Cybersecurity',
        graduationYear: 2025,
        reputationScore: 4.85,
        completedExchanges: 12,
        isVerified: true,
        isRealUser: true,
        userBadge: 'VERIFIED',
        bio: 'Cybersecurity student teaching Web Security & Ethical Hacking.',
        teachingSkills: [{ id: 'sk_sec_808', name: 'Web Security & Linux', proficiency: 'Advanced' }],
        learningSkills: [{ id: 'sk_python_202', name: 'Python Scripts', proficiency: 'Intermediate' }],
      },
      matchScore: 92,
      compatibilityScore: 92,
    },
    {
      user: {
        id: 'usr_sarah_119d6c',
        fullName: 'Sarah Chen',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        university: 'Stanford University',
        course: 'Data Science',
        graduationYear: 2026,
        reputationScore: 4.9,
        completedExchanges: 14,
        isVerified: false,
        isRealUser: false,
        userBadge: 'SAMPLE_EXAMPLE',
        bio: 'Data Science senior passionate about Machine Learning, Python, and SQL.',
        teachingSkills: [{ id: 'sk_python_202', name: 'Python & Pandas', proficiency: 'Advanced' }],
        learningSkills: [{ id: 'sk_react_101', name: 'React.js', proficiency: 'Beginner' }],
      },
      matchScore: 90,
      compatibilityScore: 90,
    },
    {
      user: {
        id: 'usr_alex_332b8e',
        fullName: 'Alex Morgan',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        university: 'Stanford University',
        course: 'Software Engineering',
        graduationYear: 2025,
        reputationScore: 4.8,
        completedExchanges: 11,
        isVerified: false,
        isRealUser: false,
        userBadge: 'SAMPLE_EXAMPLE',
        bio: 'Full Stack enthusiast specializing in React, TypeScript, and Node.js.',
        teachingSkills: [{ id: 'sk_react_101', name: 'React.js & Next.js', proficiency: 'Advanced' }],
        learningSkills: [{ id: 'sk_docker_303', name: 'Docker & DevOps', proficiency: 'Beginner' }],
      },
      matchScore: 89,
      compatibilityScore: 89,
    },
    {
      user: {
        id: 'usr_david_445c9a',
        fullName: 'David Kumar',
        avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        university: 'MIT',
        course: 'Computer Science',
        graduationYear: 2026,
        reputationScore: 4.85,
        completedExchanges: 15,
        isVerified: false,
        isRealUser: false,
        userBadge: 'SAMPLE_EXAMPLE',
        bio: 'Backend Architecture, System Design, and Microservices developer.',
        teachingSkills: [{ id: 'sk_sys_505', name: 'System Design & Distributed Systems', proficiency: 'Advanced' }],
        learningSkills: [{ id: 'sk_python_202', name: 'Python', proficiency: 'Beginner' }],
      },
      matchScore: 88,
      compatibilityScore: 88,
    },
  ];

  const rawMatches = matches.length > 0 ? matches : defaultMatches;

  // Filter matches by minMatchScore
  const filteredMatches = rawMatches.filter((match: any) => {
    const score = match.matchScore ?? match.compatibilityScore ?? 85;
    return score >= minMatchScore;
  });

  const handleSendSwap = (match: any) => {
    if (checkIsRemovedByAdmin(match.user)) {
      alert('Action Denied: This user account has been removed by the Admin.');
      return;
    }

    const offeredSkill = match.user.learningSkills?.[0] || match.offeredSkill;
    const requestedSkill = match.user.teachingSkills?.[0] || match.requestedSkill;

    sendSwapMutation.mutate({
      receiverId: match.user.id,
      offeredSkillId: offeredSkill?.id || 'sk_python_202',
      requestedSkillId: requestedSkill?.id || 'sk_react_101',
      message: `Hi ${match.user.fullName}, I noticed our ${match.compatibilityScore || match.matchScore || 90}% reciprocal match! Would love to swap skills.`,
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-2">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
          <Sparkles className="w-4 h-4 text-amber-500" /> AI Reciprocal Matching Engine
        </div>
        <h1 className="text-2xl font-black text-textMain">Discover Skill Swap Partners</h1>
        <p className="text-xs text-textMuted max-w-2xl leading-relaxed">
          Connect with peers who teach what you want to learn, and want to learn what you teach. 100% free student exchange.
        </p>

        {/* Global Feedback Banners */}
        {swapSuccessMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{swapSuccessMsg}</span>
          </div>
        )}
        {swapErrorMsg && (
          <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4.5 h-4.5 flex-shrink-0" />
            <span>{swapErrorMsg}</span>
          </div>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-surfaceBorder flex flex-col md:flex-row gap-4 items-center justify-between">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-textMuted absolute left-3 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by skill name, topic, or university..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-surface border border-surfaceBorder text-xs text-textMain focus:outline-none focus:border-slate-500"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 custom-scrollbar">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white shadow-sm'
                : 'bg-surface border-surfaceBorder text-textMuted hover:text-textMain'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat: any) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border flex-shrink-0 ${
                selectedCategory === cat.id
                  ? 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 border-slate-950 dark:border-white shadow-sm'
                  : 'bg-surface border-surfaceBorder text-textMuted hover:text-textMain'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Min Match Filter Slider */}
        <div className="flex items-center gap-2 text-xs text-textMuted w-full md:w-auto justify-end">
          <SlidersHorizontal className="w-4 h-4 text-slate-500" />
          <span>Min Match: <strong className="text-textMain font-black">{minMatchScore}%</strong></span>
          <input
            type="range"
            min="0"
            max="95"
            step="5"
            value={minMatchScore}
            onChange={(e) => setMinMatchScore(Number(e.target.value))}
            className="w-24 accent-slate-900 dark:accent-white"
          />
        </div>
      </div>

      {/* Student Cards Grid */}
      {isLoadingMatches ? (
        <div className="text-xs text-textMuted p-8">Searching compatible student matches...</div>
      ) : filteredMatches.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl text-center space-y-2">
          <UserCheck className="w-10 h-10 text-textMuted mx-auto" />
          <h3 className="text-sm font-bold text-textMain">No Compatible Peer Matches Found</h3>
          <p className="text-xs text-textMuted">Try adjusting your skill search filters or setting min match score to 0%.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMatches.map((match: any) => {
            const isRemoved = checkIsRemovedByAdmin(match.user);
            const score = match.compatibilityScore ?? match.matchScore ?? 90;
            const verified = isUserVerified(match.user);

            return (
              <div
                key={match.user.id}
                className={`glass-card p-5 rounded-2xl border space-y-4 flex flex-col justify-between shadow-sm transition-all ${
                  isRemoved
                    ? 'border-red-500/50 bg-red-500/5 opacity-85'
                    : 'border-surfaceBorder hover:border-slate-500'
                }`}
              >
                <div className="space-y-4">
                  {/* Top Bar: Match Badge & Status */}
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-950 dark:bg-white text-white dark:text-slate-950 shadow-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-amber-400" /> {score}% Reciprocal Match
                    </span>

                    {isRemoved ? (
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center gap-1">
                        <UserX className="w-3 h-3" /> Account Removed
                      </span>
                    ) : verified ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
                        Sample Profile
                      </span>
                    )}
                  </div>

                  {/* Account Removed Warning Banner */}
                  {isRemoved && (
                    <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[11px] font-extrabold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>🚫 Account Removed by Admin</span>
                    </div>
                  )}

                  {/* Student Identity */}
                  <div className="flex items-center gap-3">
                    <img
                      src={match.user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                      alt="Avatar"
                      className="w-12 h-12 rounded-xl border border-surfaceBorder object-cover shadow-sm"
                    />
                    <div className="overflow-hidden">
                      <h3 className="text-sm font-black text-textMain truncate flex items-center gap-1">
                        {match.user.fullName}
                      </h3>
                      <p className="text-[11px] text-textMuted truncate flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-500" /> {match.user.university}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-textMuted mt-0.5">
                        <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                          <Star className="w-3 h-3 fill-amber-400" /> {match.user.reputationScore}
                        </span>
                        <span>•</span>
                        <span>{match.user.completedExchanges || 0} Swaps</span>
                      </div>
                    </div>
                  </div>

                  {/* Skills Compatibility Matrix */}
                  <div className="space-y-2 text-xs pt-1 border-t border-surfaceBorder">
                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block mb-1">
                        Can Teach You:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {match.user.teachingSkills?.map((sk: any) => (
                          <span key={sk.id} className="px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-textMain text-[11px] font-semibold">
                            {sk.name} <span className="text-[9px] text-slate-500">({sk.proficiency})</span>
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-textMuted uppercase tracking-wider block mb-1">
                        Wants to Learn:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {match.user.learningSkills?.map((sk: any) => (
                          <span key={sk.id} className="px-2 py-0.5 rounded-md bg-slate-900/10 dark:bg-white/10 text-slate-900 dark:text-white border border-slate-900/20 dark:border-white/20 text-[11px] font-semibold">
                            {sk.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Card Action Bar */}
                <div className="pt-3 border-t border-surfaceBorder flex items-center justify-between gap-2">
                  <button
                    onClick={() => setViewStudentModal(match)}
                    className="text-xs font-bold text-textMuted hover:text-textMain px-2 py-1.5 rounded-lg hover:bg-surface transition-colors"
                  >
                    View Profile
                  </button>

                  <button
                    onClick={() => handleSendSwap(match)}
                    disabled={sendSwapMutation.isPending || isRemoved}
                    className={`text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all ${
                      isRemoved
                        ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 border border-slate-400 cursor-not-allowed opacity-60'
                        : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100 active:scale-95'
                    }`}
                  >
                    <Send className="w-3.5 h-3.5" /> Quick Swap Request
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW STUDENT DETAIL MODAL */}
      {viewStudentModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-3xl max-w-lg w-full space-y-5 border border-surfaceBorder shadow-2xl relative animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start border-b border-surfaceBorder pb-4">
              <div className="flex items-center gap-3">
                <img
                  src={viewStudentModal.user.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                  alt="Avatar"
                  className="w-12 h-12 rounded-xl border border-surfaceBorder object-cover"
                />
                <div>
                  <h3 className="text-base font-extrabold text-textMain flex items-center gap-2">
                    {viewStudentModal.user.fullName}
                    {checkIsRemovedByAdmin(viewStudentModal.user) ? (
                      <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/30 flex items-center gap-1">
                        <UserX className="w-3 h-3 text-red-500" /> Account Removed by Admin
                      </span>
                    ) : isUserVerified(viewStudentModal.user) ? (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                        ✓ Verified
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-500 border border-slate-500/20">
                        Sample Profile
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-textMuted flex items-center gap-1">
                    <GraduationCap className="w-3.5 h-3.5 text-slate-500" /> {viewStudentModal.user.university}
                  </p>
                </div>
              </div>

              <button onClick={() => setViewStudentModal(null)} className="p-1 rounded-lg hover:bg-surface text-textMuted">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Account Removal Alert */}
            {checkIsRemovedByAdmin(viewStudentModal.user) && (
              <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-xs font-bold flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>This user account has been removed by the Admin. Skill swap requests are disabled.</span>
              </div>
            )}

            {/* Bio & Skills */}
            <div className="p-3 rounded-xl bg-surface border border-surfaceBorder text-xs text-textMain leading-relaxed">
              {viewStudentModal.user.bio || 'Verified student eager to learn and teach software skills.'}
            </div>

            {/* Modal Action Bar */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-surfaceBorder">
              <button
                onClick={() => setViewStudentModal(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-textMuted hover:text-textMain"
              >
                Close
              </button>
              <button
                disabled={checkIsRemovedByAdmin(viewStudentModal.user)}
                onClick={() => handleSendSwap(viewStudentModal)}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-md ${
                  checkIsRemovedByAdmin(viewStudentModal.user)
                    ? 'bg-slate-300 dark:bg-slate-800 text-slate-500 border border-slate-400 cursor-not-allowed opacity-60'
                    : 'bg-slate-950 dark:bg-white text-white dark:text-slate-950 hover:bg-slate-800 dark:hover:bg-slate-100'
                }`}
              >
                <Send className="w-3.5 h-3.5" /> Send Swap Request
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
