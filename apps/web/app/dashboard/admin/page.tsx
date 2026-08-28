'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { ShieldCheck, Users, Repeat, Star, BookOpen, AlertTriangle, Trash2, Search, CheckCircle, UserX } from 'lucide-react';

export default function AdminPage() {
  const queryClient = useQueryClient();
  const [userSearch, setUserSearch] = useState('');
  const [removeSuccessMsg, setRemoveSuccessMsg] = useState('');

  // Fetch admin analytics
  const { data: analyticsRes, isLoading } = useQuery({
    queryKey: ['adminAnalytics'],
    queryFn: () => fetchApi('/admin/analytics'),
  });

  // Fetch registered users for user management table
  const { data: usersRes, refetch: refetchUsers } = useQuery({
    queryKey: ['adminUsersList', userSearch],
    queryFn: () => fetchApi(`/admin/users?search=${encodeURIComponent(userSearch)}`),
  });

  // Fetch content reports
  const { data: reportsRes } = useQuery({
    queryKey: ['adminReports'],
    queryFn: () => fetchApi('/admin/reports'),
  });

  // Delete / Remove User Mutation
  const deleteUserMutation = useMutation({
    mutationFn: (userId: string) => fetchApi(`/admin/users/${userId}`, { method: 'DELETE' }),
    onSuccess: (res, userId) => {
      queryClient.invalidateQueries({ queryKey: ['adminAnalytics'] });
      queryClient.invalidateQueries({ queryKey: ['adminUsersList'] });
      refetchUsers();
      setRemoveSuccessMsg(`User account successfully removed from platform.`);
      setTimeout(() => setRemoveSuccessMsg(''), 3000);
    },
  });

  const handleRemoveUser = (user: any) => {
    if (user.role === 'ADMIN') {
      alert('Cannot remove an Admin account.');
      return;
    }
    const confirmed = window.confirm(
      `Are you sure you want to remove user "${user.profile?.fullName || user.email}" (${user.email})?\n\nThis will permanently delete their account and data.`
    );
    if (confirmed) {
      deleteUserMutation.mutate(user.id);
    }
  };

  const overview = analyticsRes?.data?.overview;
  const usersList = usersRes?.data?.users || analyticsRes?.data?.recentUsers || [];
  const reports = reportsRes?.data || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="glass-panel p-6 rounded-2xl border border-amber-500/20 bg-gradient-to-r from-amber-950/30 via-surface to-background space-y-2">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-amber-400" /> Admin & Project Owner Control Center
          </h1>
          <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 font-extrabold text-xs border border-amber-500/30">
            Project Owner View
          </span>
        </div>
        <p className="text-xs text-slate-300">
          Manage registered accounts, view analytics, and remove any suspicious or odd profiles.
        </p>
      </div>

      {removeSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center gap-2 shadow-md">
          <CheckCircle className="w-4 h-4 text-emerald-500" /> {removeSuccessMsg}
        </div>
      )}

      {isLoading ? (
        <p className="text-xs text-slate-400">Loading admin metrics...</p>
      ) : (
        <>
          {/* Analytics Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Total Users</span>
              <p className="text-2xl font-bold text-white">{overview?.totalUsers || 0}</p>
              <p className="text-[11px] text-slate-400">{overview?.dailyActiveUsers || 0} DAU • {overview?.monthlyActiveUsers || 0} MAU</p>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Total Skills Catalog</span>
              <p className="text-2xl font-bold text-indigo-400">{overview?.totalSkills || 0}</p>
              <p className="text-[11px] text-slate-400">Centralized database skills</p>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Total Exchanges</span>
              <p className="text-2xl font-bold text-cyan-400">{overview?.totalSwaps || 0}</p>
              <p className="text-[11px] text-slate-400">{overview?.completedSwaps || 0} completed swaps</p>
            </div>

            <div className="glass-card p-4 rounded-xl space-y-1">
              <span className="text-xs text-slate-400">Average Platform Rating</span>
              <p className="text-2xl font-bold text-amber-400">{overview?.averageRating || 5.0} ★</p>
              <p className="text-[11px] text-slate-400">{overview?.totalRatings || 0} reviews submitted</p>
            </div>
          </div>

          {/* User Management & Account Removal Table */}
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-indigo-400" /> User Accounts & Removal Control
                </h3>
                <p className="text-xs text-slate-400">Search and remove any account that appears odd or violates community rules.</p>
              </div>

              {/* Search User Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-9 pr-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-white focus:outline-none focus:border-slate-400"
                  placeholder="Search user by name or email..."
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-surfaceBorder text-slate-400 uppercase text-[10px] tracking-wider">
                    <th className="p-3">User Profile</th>
                    <th className="p-3">Email Address</th>
                    <th className="p-3">University</th>
                    <th className="p-3">Role</th>
                    <th className="p-3">Joined Date</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surfaceBorder">
                  {usersList.map((u: any) => (
                    <tr key={u.id} className="hover:bg-surface/50 transition-colors">
                      <td className="p-3 flex items-center gap-3">
                        <img
                          src={u.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Demo'}
                          alt="Avatar"
                          className="w-8 h-8 rounded-full border border-slate-600 object-cover"
                        />
                        <div>
                          <span className="font-bold text-white block">{u.profile?.fullName || 'User'}</span>
                          <span className="text-[10px] text-slate-400">{u.profile?.course || 'Student'}</span>
                        </div>
                      </td>

                      <td className="p-3 text-slate-300 font-mono text-[11px]">{u.email}</td>
                      <td className="p-3 text-slate-300">{u.profile?.university || 'SkillXchange'}</td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {u.role}
                        </span>
                      </td>

                      <td className="p-3 text-slate-400 text-[11px]">{new Date(u.createdAt).toLocaleDateString()}</td>

                      <td className="p-3 text-right">
                        {u.role !== 'ADMIN' ? (
                          <button
                            onClick={() => handleRemoveUser(u)}
                            className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold hover:bg-red-500 hover:text-white transition-all flex items-center gap-1 ml-auto"
                            title="Remove / Ban User"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remove User
                          </button>
                        ) : (
                          <span className="text-[10px] text-slate-500 italic">Protected Admin</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Moderation Queue */}
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Content Moderation Queue
            </h3>

            {reports.length === 0 ? (
              <p className="text-xs text-slate-500 py-6 text-center">No reported users or content items.</p>
            ) : (
              <div className="space-y-3">
                {reports.map((rep: any) => (
                  <div key={rep.id} className="p-3 rounded-lg bg-surface border border-surfaceBorder space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="font-bold text-red-400">Reason: {rep.reason}</span>
                      <span className="text-[10px] text-slate-400">{rep.status}</span>
                    </div>
                    <p className="text-[11px] text-slate-300">Reporter: {rep.reporter?.email}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
