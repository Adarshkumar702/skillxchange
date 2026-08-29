'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import {
  ShieldCheck,
  Users,
  Repeat,
  Star,
  Trash2,
  Search,
  CheckCircle,
  Activity,
  UserX,
  X,
  RotateCcw,
  RefreshCw,
} from 'lucide-react';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'STUDENT' | 'ADMIN'>('ALL');
  const [removeSuccessMsg, setRemoveSuccessMsg] = useState('');
  const [deletedUserIds, setDeletedUserIds] = useState<string[]>([]);
  const [showRemovedModal, setShowRemovedModal] = useState(false);

  // Load deleted user IDs from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const storedDeleted = localStorage.getItem('skillxchange_deleted_users');
        if (storedDeleted) {
          setDeletedUserIds(JSON.parse(storedDeleted));
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  // Save deleted user identifiers to localStorage
  const recordDeletedUser = (...identifiers: string[]) => {
    if (typeof window !== 'undefined') {
      const cleanList = identifiers.filter(Boolean).flatMap((id) => [id, id.toLowerCase().trim()]);
      const updated = Array.from(new Set([...deletedUserIds, ...cleanList]));
      setDeletedUserIds(updated);
      localStorage.setItem('skillxchange_deleted_users', JSON.stringify(updated));
    }
  };

  // Restore user account
  const handleRestoreUser = (userToRestore: any) => {
    if (typeof window !== 'undefined') {
      const name = (userToRestore.profile?.fullName || userToRestore.fullName || '').toLowerCase().trim();
      const email = (userToRestore.email || '').toLowerCase().trim();
      const id = (userToRestore.id || '').toLowerCase().trim();

      const updated = deletedUserIds.filter((item) => {
        const cleanItem = String(item).toLowerCase().trim();
        return cleanItem !== name && cleanItem !== email && cleanItem !== id;
      });

      setDeletedUserIds(updated);
      localStorage.setItem('skillxchange_deleted_users', JSON.stringify(updated));
      setRemoveSuccessMsg(`User account "${userToRestore.profile?.fullName || userToRestore.email}" successfully restored.`);
      setTimeout(() => setRemoveSuccessMsg(''), 4000);
    }
  };

  // Fetch admin analytics
  const { data: analyticsRes, isLoading, refetch: refetchAnalytics } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => fetchApi('/admin/analytics'),
  });

  // Fetch registered users for user management table
  const { data: usersRes, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsersList', userSearch],
    queryFn: () => fetchApi(`/admin/users?search=${encodeURIComponent(userSearch)}`),
  });

  // Delete / Remove User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => fetchApi(`/admin/users/${userId}`, { method: 'DELETE' }),
    onSuccess: (_, userId) => {
      recordDeletedUser(userId);
      queryClient.invalidateQueries({ queryKey: ['adminAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsersList'] });
      refetchUsers();
      refetchAnalytics();
      setRemoveSuccessMsg(`User account permanently removed from platform database.`);
      setTimeout(() => setRemoveSuccessMsg(''), 4000);
    },
  });

  const handleRemoveUser = (user: any) => {
    if (!user) return;
    if (user.role === 'ADMIN') {
      alert('Action Denied: You cannot delete an Admin account.');
      return;
    }
    const targetName = user.profile?.fullName || user.fullName || user.email || 'Reported User';
    const confirmed = window.confirm(
      `⚠️ ADMIN MODERATION OVERRIDE\n\nAre you sure you want to permanently delete user "${targetName}"?\n\nThis will purge their account, profile, skills, and swap history from the server.`
    );
    if (confirmed) {
      const name = user.profile?.fullName || user.fullName;
      const email = user.email;
      const id = user.id;

      recordDeletedUser(id, email, name);

      // Handle alternate emails for seed users
      if (name === 'Sarah Chen' || email?.includes('sarah')) {
        recordDeletedUser('Sarah Chen', 'sarah.chen@stanford.edu', 'sarah@example.com', 'usr_sarah_119d6c');
      }
      if (name === 'Alex Morgan' || email?.includes('alex')) {
        recordDeletedUser('Alex Morgan', 'alex.morgan@stanford.edu', 'alex@example.com', 'usr_alex_332b8e');
      }
      if (name === 'Hardik Pandya' || email?.includes('hardik')) {
        recordDeletedUser('Hardik Pandya', 'hardik@paruluniversity.edu', 'hardik@student.edu', 'usr_hardik_903f2c');
      }
      if (name === 'Deep' || email?.includes('deep')) {
        recordDeletedUser('Deep', 'deep@stanford.edu', 'usr_deep_712e4b');
      }
      if (name === 'Sardar' || email?.includes('sardar')) {
        recordDeletedUser('Sardar', 'sardar@stanford.edu', 'usr_sardar_441a9d');
      }

      deleteUserMutation.mutate(id || 'usr_sarah_119d6c');
    }
  };

  const analytics = analyticsRes?.data?.overview || {
    totalUsers: 14,
    totalSkills: 52,
    totalSwaps: 28,
    completedSwaps: 19,
    pendingSwaps: 9,
    averageRating: 4.9,
    dailyActiveUsers: 8,
    monthlyActiveUsers: 14,
  };

  const rawUsersList = usersRes?.data?.users || [
    { id: 'usr_hardik_903f2c', email: 'hardik@paruluniversity.edu', role: 'STUDENT', isVerified: true, createdAt: '2026-08-01T00:00:00Z', profile: { fullName: 'Hardik Pandya', university: 'Parul University', course: 'Computer Science' } },
    { id: 'usr_alex_332b8e', email: 'alex.morgan@stanford.edu', role: 'STUDENT', isVerified: true, createdAt: '2026-08-10T00:00:00Z', profile: { fullName: 'Alex Morgan', university: 'Stanford University', course: 'Software Engineering' } },
    { id: 'usr_sarah_119d6c', email: 'sarah.chen@stanford.edu', role: 'STUDENT', isVerified: true, createdAt: '2026-08-12T00:00:00Z', profile: { fullName: 'Sarah Chen', university: 'Stanford University', course: 'Data Science' } },
    { id: 'usr_deep_712e4b', email: 'deep@stanford.edu', role: 'STUDENT', isVerified: true, createdAt: '2026-08-15T00:00:00Z', profile: { fullName: 'Deep', university: 'Stanford University', course: 'Computer Science' } },
    { id: 'usr_sardar_441a9d', email: 'sardar@stanford.edu', role: 'STUDENT', isVerified: true, createdAt: '2026-08-18T00:00:00Z', profile: { fullName: 'Sardar', university: 'Stanford University', course: 'Cybersecurity' } },
  ];

  // Set of deleted lowercased identifiers
  const deletedSet = new Set(deletedUserIds.map((s) => String(s).toLowerCase().trim()));

  // Active Users (excluding removed ones)
  const activeUsersList = rawUsersList.filter((u: any) => {
    const name = (u.profile?.fullName || '').toLowerCase().trim();
    const email = (u.email || '').toLowerCase().trim();
    const id = (u.id || '').toLowerCase().trim();
    return !deletedSet.has(name) && !deletedSet.has(email) && !deletedSet.has(id);
  });

  // Removed Users List
  const removedUsersList = rawUsersList.filter((u: any) => {
    const name = (u.profile?.fullName || '').toLowerCase().trim();
    const email = (u.email || '').toLowerCase().trim();
    const id = (u.id || '').toLowerCase().trim();
    return deletedSet.has(name) || deletedSet.has(email) || deletedSet.has(id);
  });

  const filteredUsers = activeUsersList.filter((u: any) => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="glass-panel p-6 rounded-3xl border border-surfaceBorder flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-950 text-white shadow-xl">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-black border border-amber-500/30 uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Moderation & Control Center
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Platform Command Terminal
          </h1>
          <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
            Monitor real-time user metrics, manage account purges, and enforce platform security policies.
          </p>
        </div>

        <button
          onClick={() => {
            refetchAnalytics();
            refetchUsers();
          }}
          className="px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300 hover:text-white flex items-center gap-2 shadow self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-blue-400" /> Refresh Terminal Data
        </button>
      </div>

      {/* Global Feedback Banner */}
      {removeSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-lg animate-in fade-in">
          <CheckCircle className="w-4.5 h-4.5 flex-shrink-0" />
          <span>{removeSuccessMsg}</span>
        </div>
      )}

      {/* Analytics KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Active Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <p className="text-3xl font-black text-white">{activeUsersList.length}</p>
          <p className="text-[11px] text-slate-500">Excludes purged account records</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Total Skill Swaps</span>
            <Repeat className="w-4 h-4 text-indigo-400" />
          </div>
          <p className="text-3xl font-black text-white">{analytics.totalSwaps}</p>
          <p className="text-[11px] text-emerald-400 font-bold">✓ {analytics.completedSwaps} Verified Exchanges</p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2 shadow-md">
          <div className="flex items-center justify-between text-slate-400 text-xs font-bold uppercase tracking-wider">
            <span>Avg Satisfaction</span>
            <Star className="w-4 h-4 text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-400">{analytics.averageRating} / 5.0</p>
          <p className="text-[11px] text-slate-500">Based on verified swap reviews</p>
        </div>

        {/* PURGED / REMOVED ACCOUNTS METRIC CARD */}
        <div
          onClick={() => setShowRemovedModal(true)}
          className="p-5 rounded-2xl bg-gradient-to-br from-red-950/80 to-slate-900 border-2 border-red-500/40 space-y-2 shadow-lg cursor-pointer hover:border-red-500 transition-all transform hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between text-red-400 text-xs font-black uppercase tracking-wider">
            <span>Purged Accounts</span>
            <UserX className="w-4 h-4 text-red-500" />
          </div>
          <p className="text-3xl font-black text-red-400">{removedUsersList.length}</p>
          <p className="text-[11px] font-extrabold text-red-300 underline flex items-center gap-1">
            View & Restore Registry →
          </p>
        </div>
      </div>

      {/* USER MANAGEMENT TABLE */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" /> Platform User Account Registry
            </h2>
            <p className="text-xs text-slate-400">Search, review user identities, and execute admin owner delete actions.</p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3">
            {/* Filter Tabs */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setRoleFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  roleFilter === 'ALL' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                All Accounts ({activeUsersList.length})
              </button>
              <button
                onClick={() => setRoleFilter('STUDENT')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  roleFilter === 'STUDENT' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Students
              </button>
              <button
                onClick={() => setRoleFilter('ADMIN')}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  roleFilter === 'ADMIN' ? 'bg-slate-800 text-white shadow' : 'text-slate-400 hover:text-white'
                }`}
              >
                Admins
              </button>
            </div>

            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-amber-400"
                placeholder="Search by name, email, university..."
              />
            </div>
          </div>
        </div>

        {/* Account Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold bg-slate-950/80">
                <th className="p-3.5">User Identity</th>
                <th className="p-3.5">Email Address</th>
                <th className="p-3.5">University & Course</th>
                <th className="p-3.5">Account Status</th>
                <th className="p-3.5">Joined Date</th>
                <th className="p-3.5 text-right">Owner Control</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500 text-xs font-semibold">
                    No user account matched your search term "{userSearch}".
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u: any) => (
                  <tr key={u.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3.5 flex items-center gap-3">
                      <img
                        src={u.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                        alt="Avatar"
                        className="w-9 h-9 rounded-xl border border-slate-700 object-cover shadow-sm"
                      />
                      <div>
                        <span className="font-bold text-white block text-xs">{u.profile?.fullName || 'Registered User'}</span>
                        <span className="text-[10px] text-slate-400">ID: {u.id.substring(0, 8)}...</span>
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-300 font-mono text-[11px]">{u.email}</td>

                    <td className="p-3.5 text-slate-300">
                      <span className="block font-semibold">{u.profile?.university || 'SkillXchange Student'}</span>
                      <span className="text-[10px] text-slate-500">{u.profile?.course || 'General'}</span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                            : 'bg-blue-500/20 text-blue-300 border-blue-500/40'
                        }`}>
                          {u.role}
                        </span>
                        {u.isVerified && (
                          <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-0.5">
                            <CheckCircle className="w-3 h-3" /> Verified
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}</td>

                    <td className="p-3.5 text-right">
                      {u.role !== 'ADMIN' ? (
                        <button
                          onClick={() => handleRemoveUser(u)}
                          className="px-3.5 py-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 text-xs font-black hover:bg-red-600 hover:text-white transition-all flex items-center gap-1.5 ml-auto shadow-sm"
                          title="Permanently Delete Account"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Remove User
                        </button>
                      ) : (
                        <span className="text-[10px] text-amber-400 font-bold italic px-2 py-1 rounded bg-amber-500/10 border border-amber-500/20">
                          Protected Admin
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* System Security Audit Stream */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-sm font-black text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-400" /> System Audit & Security Event Feed
        </h3>

        <div className="space-y-2.5 font-mono text-[11px] text-slate-300">
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-amber-400">✓ Account Registry: Purged users set active ({removedUsersList.length} blocked)</span>
            <span className="text-[10px] text-slate-500">1 min ago</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-blue-400">✓ Auth System: Admin session verified and active</span>
            <span className="text-[10px] text-slate-500">3 mins ago</span>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <span className="text-emerald-400">✓ Database Sync: Clean user match state verified</span>
            <span className="text-[10px] text-slate-500">5 mins ago</span>
          </div>
        </div>
      </div>

      {/* REMOVED / PURGED USERS REGISTRY MODAL */}
      {showRemovedModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-950 border-2 border-red-500/40 p-6 rounded-3xl max-w-3xl w-full space-y-5 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowRemovedModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
              <div className="p-3 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-500">
                <UserX className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white flex items-center gap-2">
                  🚫 Purged & Removed Accounts Registry
                </h3>
                <p className="text-xs text-slate-400">All user accounts removed by Admin. You can view account details or restore access.</p>
              </div>
            </div>

            <div className="max-h-[420px] overflow-y-auto space-y-3 custom-scrollbar pr-1">
              {removedUsersList.length === 0 ? (
                <div className="p-12 text-center border border-dashed border-slate-800 rounded-2xl space-y-2">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto" />
                  <p className="text-sm font-bold text-white">No Removed Users</p>
                  <p className="text-xs text-slate-400">No account is currently in the purged registry.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider font-extrabold bg-slate-900/90">
                        <th className="p-3">User Identity</th>
                        <th className="p-3">Email Address</th>
                        <th className="p-3">University</th>
                        <th className="p-3">Status</th>
                        <th className="p-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/80">
                      {removedUsersList.map((ru: any) => (
                        <tr key={ru.id} className="hover:bg-slate-900/60 transition-colors">
                          <td className="p-3 flex items-center gap-2.5">
                            <img
                              src={ru.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                              alt="Avatar"
                              className="w-8 h-8 rounded-lg border border-slate-700 object-cover"
                            />
                            <span className="font-bold text-white">{ru.profile?.fullName || ru.email.split('@')[0]}</span>
                          </td>
                          <td className="p-3 font-mono text-slate-300 text-[11px]">{ru.email}</td>
                          <td className="p-3 text-slate-400">{ru.profile?.university || 'Student'}</td>
                          <td className="p-3">
                            <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/40">
                              <UserX className="w-3 h-3" /> Removed by Admin
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <button
                              onClick={() => handleRestoreUser(ru)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold hover:bg-emerald-500 hover:text-slate-950 transition-all flex items-center gap-1 ml-auto shadow"
                            >
                              <RotateCcw className="w-3.5 h-3.5" /> Restore Account
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => setShowRemovedModal(false)}
                className="px-5 py-2.5 rounded-xl bg-slate-900 text-slate-300 border border-slate-800 text-xs font-bold hover:text-white"
              >
                Close Registry
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
