import { prisma } from '../config/prisma';
import { SkillType } from '@skillxchange/shared';

export interface MatchRecommendation {
  user: {
    id: string;
    fullName: string;
    avatarUrl: string | null;
    university: string;
    course: string;
    graduationYear: number;
    location: string | null;
    bio: string | null;
    githubUrl: string | null;
    linkedinUrl: string | null;
    reputationScore: number;
    completedExchanges: number;
    isRealUser: boolean;
    userBadge: 'VERIFIED_STUDENT' | 'SAMPLE_EXAMPLE';
    teachingSkills: Array<{ id: string; name: string; proficiency: string }>;
    learningSkills: Array<{ id: string; name: string; proficiency: string }>;
  };
  compatibilityScore: number;
  explanations: string[];
  matchedTeachingSkill?: { id: string; name: string };
  matchedLearningSkill?: { id: string; name: string };
}

export class MatchingService {
  public async getMatchesForUser(
    currentUserId: string,
    limit = 20,
    filters?: {
      university?: string;
      skillId?: string;
      minRating?: number;
      search?: string;
      onlyRealUsers?: boolean;
    }
  ): Promise<MatchRecommendation[]> {
    // 1. Fetch current user with skills and profile
    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: {
        profile: true,
        skills: {
          include: { skill: true },
        },
      },
    });

    if (!currentUser || !currentUser.profile) {
      throw new Error('Current user profile not found');
    }

    const currentTeaching = currentUser.skills.filter((s) => s.type === SkillType.TEACHING);
    const currentLearning = currentUser.skills.filter((s) => s.type === SkillType.LEARNING);

    const currentTeachingSkillIds = new Set(currentTeaching.map((s) => s.skillId));
    const currentLearningSkillIds = new Set(currentLearning.map((s) => s.skillId));

    // 2. Fetch candidate users (excluding current user and admins)
    const candidateWhere: any = {
      id: { not: currentUserId },
      role: { not: 'ADMIN' },
    };

    if (filters?.university) {
      candidateWhere.profile = { university: { contains: filters.university, mode: 'insensitive' } };
    }

    let candidates = await prisma.user.findMany({
      where: candidateWhere,
      include: {
        profile: true,
        skills: {
          include: { skill: true },
        },
      },
      take: 100,
    });

    if (filters?.search) {
      const q = filters.search.trim().toLowerCase();
      candidates = candidates.filter((c) =>
        (c.profile?.fullName || '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.profile?.university || '').toLowerCase().includes(q) ||
        (c.profile?.course || '').toLowerCase().includes(q)
      );
    }

    if (filters?.minRating) {
      candidates = candidates.filter((c) => (c.profile?.reputationScore || 0) >= filters.minRating!);
    }

    // Pure static placeholder emails that render as Sample Profile
    const pureSampleEmails = ['alex@example.com', 'sarah@example.com', 'david@example.com'];

    const isCandidateRealUser = (c: typeof candidates[0]) => {
      // If user is verified in DB or not in static sample list, mark as Real Verified User
      if (c.isVerified === true) return true;
      const cleanEmail = (c.email || '').trim().toLowerCase();
      if (!pureSampleEmails.includes(cleanEmail)) return true;
      return false;
    };

    const realCandidates = candidates.filter((c) => isCandidateRealUser(c));
    const demoCandidates = candidates.filter((c) => !isCandidateRealUser(c));

    let finalCandidates = candidates;
    if (filters?.onlyRealUsers) {
      finalCandidates = realCandidates;
    } else if (realCandidates.length > 0) {
      finalCandidates = [...realCandidates, ...demoCandidates];
    }

    const results: MatchRecommendation[] = [];

    // 3. Compute score for each candidate
    for (const candidate of finalCandidates) {
      if (!candidate.profile) continue;

      const isRealUser = isCandidateRealUser(candidate);
      const userBadge: 'VERIFIED_STUDENT' | 'SAMPLE_EXAMPLE' = isRealUser ? 'VERIFIED_STUDENT' : 'SAMPLE_EXAMPLE';

      const candTeaching = candidate.skills.filter((s) => s.type === SkillType.TEACHING);
      const candLearning = candidate.skills.filter((s) => s.type === SkillType.LEARNING);

      const candTeachingSkillIds = new Set(candTeaching.map((s) => s.skillId));
      const candLearningSkillIds = new Set(candLearning.map((s) => s.skillId));

      const explanations: string[] = [];
      let matchPoints = 40; // base score

      if (isRealUser) {
        matchPoints += 15;
        explanations.push(`Verified Real Student registered on SkillXchange.`);
      }

      // Multi-Skill Reciprocal Overlap Calculation
      const matchingTeachSkillsList: string[] = [];
      let matchedTeachSkill: { id: string; name: string } | undefined;

      for (const item of candTeaching) {
        if (currentLearningSkillIds.has(item.skillId)) {
          if (!matchedTeachSkill) {
            matchedTeachSkill = { id: item.skill.id, name: item.skill.name };
          }
          matchingTeachSkillsList.push(item.skill.name);
          matchPoints += 25;
        }
      }

      const matchingLearnSkillsList: string[] = [];
      let matchedLearnSkill: { id: string; name: string } | undefined;

      for (const item of currentTeaching) {
        if (candLearningSkillIds.has(item.skillId)) {
          if (!matchedLearnSkill) {
            matchedLearnSkill = { id: item.skill.id, name: item.skill.name };
          }
          matchingLearnSkillsList.push(item.skill.name);
          matchPoints += 20;
        }
      }

      if (matchingTeachSkillsList.length > 0 && matchingLearnSkillsList.length > 0) {
        explanations.push(
          `🎯 Exact Reciprocal Match: ${candidate.profile.fullName} teaches ${matchingTeachSkillsList.join(', ')} (which you want to learn) & wants to learn ${matchingLearnSkillsList.join(', ')} (which you teach)!`
        );
      } else if (matchingTeachSkillsList.length > 0) {
        explanations.push(`${candidate.profile.fullName} teaches ${matchingTeachSkillsList.join(', ')}, which matches your learning goals.`);
      } else if (matchingLearnSkillsList.length > 0) {
        explanations.push(`You teach ${matchingLearnSkillsList.join(', ')}, which ${candidate.profile.fullName} wants to learn.`);
      } else if (currentTeaching.length === 0 && currentLearning.length === 0) {
        const topTeach = candTeaching[0]?.skill.name || 'Software Engineering';
        const topLearn = candLearning[0]?.skill.name || 'Coding';
        matchPoints += 30;
        explanations.push(`${candidate.profile.fullName} teaches ${topTeach} & wants to learn ${topLearn}.`);
      } else {
        const topTeach = candTeaching[0]?.skill.name || 'Development';
        matchPoints += 15;
        explanations.push(`${candidate.profile.fullName} teaches ${topTeach}. Add skills to your profile for exact reciprocal matching.`);
      }

      // C: University bonus
      if (candidate.profile.university.toLowerCase() === currentUser.profile.university.toLowerCase()) {
        matchPoints += 5;
        explanations.push(`Both study at ${candidate.profile.university}.`);
      }

      // D: Reputation bonus
      if (candidate.profile.reputationScore >= 4.8) {
        matchPoints += 4;
      }

      const compatibilityScore = Math.min(Math.round(matchPoints), 98);

      results.push({
        user: {
          id: candidate.id,
          fullName: candidate.profile.fullName,
          avatarUrl: candidate.profile.avatarUrl,
          university: candidate.profile.university,
          course: candidate.profile.course,
          graduationYear: candidate.profile.graduationYear,
          location: candidate.profile.location,
          bio: candidate.profile.bio,
          githubUrl: candidate.profile.githubUrl,
          linkedinUrl: candidate.profile.linkedinUrl,
          reputationScore: candidate.profile.reputationScore,
          completedExchanges: candidate.profile.completedExchanges,
          isRealUser,
          userBadge,
          teachingSkills: candTeaching.map((s) => ({
            id: s.skill.id,
            name: s.skill.name,
            proficiency: s.proficiency,
          })),
          learningSkills: candLearning.map((s) => ({
            id: s.skill.id,
            name: s.skill.name,
            proficiency: s.proficiency,
          })),
        },
        compatibilityScore,
        explanations,
        matchedTeachingSkill: matchedTeachSkill,
        matchedLearningSkill: matchedLearnSkill,
      });
    }

    // Sort: Real registered users first, then by compatibility score descending
    results.sort((a, b) => {
      if (a.user.isRealUser && !b.user.isRealUser) return -1;
      if (!a.user.isRealUser && b.user.isRealUser) return 1;
      return b.compatibilityScore - a.compatibilityScore;
    });

    return results.slice(0, limit);
  }
}
