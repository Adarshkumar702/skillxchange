'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchApi } from '../../../lib/apiClient';
import { useAuth } from '../../../lib/authContext';
import { User, Plus, Trash2, Github, Linkedin, Globe, MapPin, GraduationCap, Award, Star, Check, Upload, Camera } from 'lucide-react';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [isEditing, setIsEditing] = useState(false);
  const [bio, setBio] = useState(user?.profile?.bio || '');
  const [location, setLocation] = useState(user?.profile?.location || '');
  const [githubUrl, setGithubUrl] = useState(user?.profile?.githubUrl || '');
  const [linkedinUrl, setLinkedinUrl] = useState(user?.profile?.linkedinUrl || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.profile?.avatarUrl || '');

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

  // Handle local image file upload -> Base64 data URL
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('Please choose an image file under 2MB.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileMutation.mutate({ bio, location, githubUrl, linkedinUrl, avatarUrl });
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
            <div className="relative group">
              <img
                src={avatarUrl || user?.profile?.avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                alt="Avatar"
                className="w-24 h-24 rounded-2xl border-2 border-indigo-500 shadow-xl object-cover"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute inset-0 bg-slate-900/60 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center cursor-pointer transition-opacity text-white text-xs font-semibold gap-1"
              >
                <Camera className="w-5 h-5 text-indigo-400" />
                Change
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                onChange={handleImageFileChange}
                className="hidden"
              />
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-extrabold text-textMain">{user?.profile?.fullName}</h1>
              <p className="text-xs text-textMuted flex items-center gap-2">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                {user?.profile?.university} • {user?.profile?.course} ({user?.profile?.graduationYear})
              </p>
              {user?.profile?.location && (
                <p className="text-xs text-textMuted flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-textMuted" /> {user?.profile?.location}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-surface border border-surfaceBorder text-center">
              <span className="text-xs text-textMuted block">Rating</span>
              <span className="text-sm font-bold text-amber-400 flex items-center gap-1 justify-center">
                <Star className="w-3.5 h-3.5 fill-amber-400" /> {user?.profile?.reputationScore || 5.0}
              </span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-surface border border-surfaceBorder text-center">
              <span className="text-xs text-textMuted block">Exchanges</span>
              <span className="text-sm font-bold text-blue-500 dark:text-cyan-400">{user?.profile?.completedExchanges || 0}</span>
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
            {/* Avatar Picture Upload Section */}
            <div className="p-4 rounded-xl bg-slate-100 dark:bg-slate-900 border border-surfaceBorder space-y-3">
              <label className="block text-xs font-bold text-textMain flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-500" /> Profile Picture / Avatar
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={avatarUrl || 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'}
                  alt="Preview"
                  className="w-16 h-16 rounded-xl border border-slate-300 dark:border-slate-700 object-cover shadow-sm"
                />

                <div className="flex-1 space-y-2 w-full">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="avatar-file-input"
                      className="px-3.5 py-1.5 rounded-lg bg-surface border border-surfaceBorder text-xs font-semibold text-textMain hover:border-slate-400 cursor-pointer shadow-sm flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5 text-blue-500" /> Upload Image File
                    </label>
                    <input
                      id="avatar-file-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageFileChange}
                      className="hidden"
                    />
                    <span className="text-[11px] text-textMuted">Supports JPG, PNG, GIF (max 2MB)</span>
                  </div>

                  <input
                    type="text"
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain focus:outline-none focus:border-slate-400"
                    placeholder="Or paste image URL (https://...)"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-textMain mb-1">Bio Summary</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="w-full p-3 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain focus:outline-none focus:border-slate-400"
                placeholder="Share your background and learning goals..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                  placeholder="San Francisco, CA"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">GitHub URL</label>
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                  placeholder="https://github.com/username"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">LinkedIn URL</label>
                <input
                  type="url"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                  placeholder="https://linkedin.com/in/username"
                />
              </div>
            </div>

            <button type="submit" className="btn-primary text-xs font-semibold px-4 py-2 flex items-center gap-1.5">
              <Check className="w-4 h-4" /> Save Profile Changes
            </button>
          </form>
        ) : (
          <div className="space-y-3 pt-4 border-t border-surfaceBorder">
            <p className="text-xs font-medium text-textMain leading-relaxed">
              {user?.profile?.bio || 'No bio added yet. Click Edit Profile to add a summary of your experience.'}
            </p>
            <div className="flex items-center gap-4 text-xs font-semibold text-textMuted">
              {user?.profile?.githubUrl && (
                <a href={user.profile.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-600 dark:text-indigo-400 hover:underline">
                  <Github className="w-3.5 h-3.5" /> GitHub Profile
                </a>
              )}
              {user?.profile?.linkedinUrl && (
                <a href={user.profile.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-blue-500 dark:text-cyan-400 hover:underline">
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
              <h2 className="text-base font-bold text-textMain flex items-center gap-2">
                <Award className="w-4 h-4 text-blue-500" /> Skills I Can Teach
              </h2>
              <p className="text-[11px] text-textMuted">Skills you possess and are ready to mentor others in.</p>
            </div>
            <button
              onClick={() => { setSkillType('TEACHING'); setShowSkillModal(true); }}
              className="px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>

          <div className="space-y-2">
            {teachingSkills.length === 0 ? (
              <p className="text-xs text-textMuted py-4 text-center">No teaching skills added yet.</p>
            ) : (
              teachingSkills.map((item: any) => (
                <div key={item.id} className="glass-card p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-textMain block">{item.skill.name}</span>
                    <span className="text-[10px] text-blue-600 dark:text-blue-400 font-semibold uppercase">{item.proficiency}</span>
                  </div>
                  <button
                    onClick={() => removeSkillMutation.mutate(item.id)}
                    className="p-1.5 text-textMuted hover:text-red-500 transition-colors"
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
              <h2 className="text-base font-bold text-textMain flex items-center gap-2">
                <Star className="w-4 h-4 text-amber-500" /> Skills I Want to Learn
              </h2>
              <p className="text-[11px] text-textMuted">Skills you are targeting to acquire from peer mentors.</p>
            </div>
            <button
              onClick={() => { setSkillType('LEARNING'); setShowSkillModal(true); }}
              className="px-3 py-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 text-xs font-semibold flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" /> Add Skill
            </button>
          </div>

          <div className="space-y-2">
            {learningSkills.length === 0 ? (
              <p className="text-xs text-textMuted py-4 text-center">No learning skills added yet.</p>
            ) : (
              learningSkills.map((item: any) => (
                <div key={item.id} className="glass-card p-3 rounded-xl flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-textMain block">{item.skill.name}</span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold uppercase">{item.proficiency}</span>
                  </div>
                  <button
                    onClick={() => removeSkillMutation.mutate(item.id)}
                    className="p-1.5 text-textMuted hover:text-red-500 transition-colors"
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
            <h3 className="text-base font-bold text-textMain">
              Add {skillType === 'TEACHING' ? 'Teaching' : 'Learning'} Skill
            </h3>

            <form onSubmit={handleAddSkill} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Select Skill</label>
                <select
                  required
                  value={selectedSkillId}
                  onChange={(e) => setSelectedSkillId(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
                >
                  <option value="">-- Choose Skill --</option>
                  {availableSkills.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name} ({s.category?.name})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-textMain mb-1">Proficiency Level</label>
                <select
                  value={proficiency}
                  onChange={(e: any) => setProficiency(e.target.value)}
                  className="w-full p-2.5 rounded-lg bg-surface border border-surfaceBorder text-xs text-textMain"
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
                  className="px-4 py-2 rounded-lg text-xs font-semibold text-textMuted hover:text-textMain"
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
