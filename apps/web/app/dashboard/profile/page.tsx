'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { useAuth } from '../../../lib/authContext';
import { User, Plus, Trash2, Github, Linkedin, Globe, MapPin, GraduationCap, Award, Star, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [location, setLocation] = useState(user?.profile?.location || '');
  const [githubUrl, setGithubUrl] = useState(user?.profile?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.profile?.linkedinUrl || '');

  // Add Skill Modal State
  const [showSkillModal, setShowSkillModal] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState('');
  const [skillType, setSkillType] = useState<'TEACHING' | 'LEARNING'>('TEACHING');
  const [proficiency, setProficiency] = useState<'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'>('INTERMEDIATE');

  // Fetch all available skills for modal dropdown
  const { data: skillsRes } = useQuery({
    queryKey: ['availableSkills'],
    queryFn: () => fetchApi('/skills'),
  });

  const availableSkills = skillsRes?.data || [];

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: any) => fetchApi('/users/profile', { method: 'PUT', body: JSON.stringify(data) }),
    onSuccess: async () => {
      await refreshUser();
      setIsEditing(false);
    },
  });

  // Add user skill mutation
  const addSkillMutation = useMutation({
    mutationFn: (data: any) => fetchApi('/users/skills', { method: 'POST', body: JSON.stringify(data) }),
    onSuccess: async () => {
      await refreshUser();
      setShowSkillModal(false);
      setSelectedSkillId('');
    },
  });

  // Remove skill mutation
  const removeSkillMutation = useMutation({
    mutationFn: (userSkillId: string) => fetchApi(`/users/skills/${userSkillId}`, { method: 'DELETE' }),
    onSuccess: async () => {
      await refreshUser();
    },
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ bio, location, githubUrl, linkedinUrl });
  };

  const handleAddSkill = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSkillId) return;
    addSkillMutation.mutate({ skillId: selectedSkillId, type: skillType, proficiency });
  };

  const userSkills = user?.skills || [];
  const teachingSkills = userSkills.filter((s: any) => s.type === 'TEACHING');
  const learningSkills = userSkills.filter((s: any) => s.type === 'LEARNING');

  return (
    <div className="space-y-8">
      {/* Profile Header Card */}
      <div className="glass-panel p-8 rounded-2xl border border-surfaceBorder space-y-6 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <img
              src={user?.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
              alt="Avatar"
              className="w-20 h-20 rounded-2xl border-2 border-indigo-500 shadow-xl"
            />
            <div className="space-y-1">
              <h1 className="text-2xl font-bold text-white">{user?.profile?.fullName}</h1>
              <p className="text-xs text-slate-300 flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                {user?.profile?.university} • {user?.profile?.course} ({user?.profile?.graduationYear})
              </p>
              {user?.profile?.location && (
                <p className="text-xs text-slate-400 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" /> {user?.profile?.location}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-surface border border-surfaceBorder text-center">
              <span className="text-xs text-slate-400 block">Rating</span>
              <span className="text-sm font-bold text-amber-400 flex items-center gap-1 justify-center">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {user?.profile?.reputationScore || 5.0}
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-surface border border-surfaceBorder text-center">
              <span className="text-xs text-slate-400 block">Exchanges</span>
              <span className="text-sm font-bold text-cyan-400">{user?.profile?.completedExchanges || 0}</span>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="btn-primary text-xs font-semibold px-4 py-2"
            >
              {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Bio & Links */}
        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-4 pt-4 border-t border-surfaceBorder">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg bg-surface border border-surfaceBorder text-xs text-white focus:outline-none focus:border-indigo-500"
                placeholder="Share your background and learning goals..."
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                  placeholder="San Francisco, CA"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Save Changes
            </button>
          </form>
        ) : (
          <div className="space-y-3 pt-4 border-t border-surfaceBorder">
            <p className="text-xs text-slate-300 leading-relaxed">
              {user?.profile?.bio || 'No bio added yet. Click Edit Profile to add a summary of your experience.'}
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400">
              {user?.profile?.githubUrl && (
                <a href={user.profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-400 hover:underline">
                  <Github className="w-3.5 h-3.5" /> GitHub Profile
                </a>
              )}
              {user?.profile?.linkedinUrl && (
                <a href={user.profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-cyan-400 hover:underline">
                  <Linkedin className="w-3.5 h-3.5" /> LinkedIn
                </a>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Skills Management Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Teaching Skills */}
        <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Award className="w-4 h-4 text-indigo-400" /> Skills I Can Teach
              </h2>
              <p className="text-[11px] text-slate-400">Skills you possess and are ready to mentor others in.</p>
            </div>
            <button
              onClick={() => { setSkillType('TEACHING'); setShowSkillModal(true); }}
              className="px-3 py-1.5 rounded-lg bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>

          <div className="space-y-2">
            {teachingSkills.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No teaching skills added yet.</p>
            ) : (
              teachingSkills.map((item: any) => (
                <div key={item.id} className="glass-card p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{item.skill.name}</span>
                    <span className="text-[10px] text-indigo-400 font-semibold uppercase">{item.proficiency}</span>
                  </div>
                  <button
                    onClick={() => removeSkillMutation.mutate(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Learning Skills */}
        <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Star className="w-4 h-4 text-cyan-400" /> Skills I Want to Learn
              </h2>
              <p className="text-[11px] text-slate-400">Skills you are targeting to acquire from peer mentors.</p>
            </div>
            <button
              onClick={() => { setSkillType('LEARNING'); setShowSkillModal(true); }}
              className="px-3 py-1.5 rounded-lg bg-cyan-600/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>

          <div className="space-y-2">
            {learningSkills.length === 0 ? (
              <p className="text-xs text-slate-500 py-4 text-center">No learning skills added yet.</p>
            ) : (
              learningSkills.map((item: any) => (
                <div key={item.id} className="glass-card p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-white block">{item.skill.name}</span>
                    <span className="text-[10px] text-cyan-400 font-semibold uppercase">{item.proficiency}</span>
                  </div>
                  <button
                    onClick={() => removeSkillMutation.mutate(item.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      {showSkillModal && (
        <div className="fixed inset-0 z-50 glass-panel bg-background/80 flex items-center justify-center p-4">
          <div className="glass-panel p-6 rounded-2xl border border-surfaceBorder max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-base font-bold text-white">
              Add {skillType === 'TEACHING' ? 'Teaching' : 'Learning'} Skill
            </h3>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Skill</label>
                <select
                  required
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                >
                  <option value="">-- Choose Skill --</option>
                  {availableSkills.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category?.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Proficiency Level</label>
                <select
                  value={proficiency}
                  onChange={(e: any) => setProficiency(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-white"
                >
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="EXPERT">Expert</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowSkillModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary text-xs font-semibold px-4 py-2">
                  Add Skill
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
