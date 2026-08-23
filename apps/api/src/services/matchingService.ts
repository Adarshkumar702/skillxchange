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
    reputationScore: number;
    completedExchanges: number;
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

    if (filters?.minRating) {
      candidates = candidates.filter((c) => (c.profile?.reputationScore || 0) >= filters.minRating!);
    }

    const results: MatchRecommendation[] = [];

    // 3. Compute score for each candidate
    for (const candidate of candidates) {
      if (!candidate.profile) continue;

      const candTeaching = candidate.skills.filter((s) => s.type === SkillType.TEACHING);
      const candLearning = candidate.skills.filter((s) => s.type === SkillType.LEARNING);

      const candTeachingSkillIds = new Set(candTeaching.map((s) => s.skillId));
      const candLearningSkillIds = new Set(candLearning.map((s) => s.skillId));

      const explanations: string[] = [];
      let matchPoints = 30; // base score

      // A: Reciprocal Overlap (Candidate teaches what User wants)
      let matchedTeachSkill: { id: string; name: string } | undefined;
      for (const item of candTeaching) {
        if (currentLearningSkillIds.has(item.skillId)) {
          matchedTeachSkill = { id: item.skill.id, name: item.skill.name };
          matchPoints += 35;
          explanations.push(`${candidate.profile.fullName} can teach ${item.skill.name}, which you want to learn.`);
          break;
        }
      }

      // B: Reciprocal Overlap (User teaches what Candidate wants)
      let matchedLearnSkill: { id: string; name: string } | undefined;
      for (const item of currentTeaching) {
        if (candLearningSkillIds.has(item.skillId)) {
          matchedLearnSkill = { id: item.skill.id, name: item.skill.name };
          matchPoints += 25;
          explanations.push(`You can teach ${item.skill.name}, which ${candidate.profile.fullName} wants to learn.`);
          break;
        }
      }

      // Filter by skillId if specified
      if (filters?.skillId) {
        if (!candTeachingSkillIds.has(filters.skillId) && !candLearningSkillIds.has(filters.skillId)) {
          continue;
        }
      }

      // C: University bonus
      if (candidate.profile.university.toLowerCase() === currentUser.profile.university.toLowerCase()) {
        matchPoints += 5;
        explanations.push(`Both study at ${candidate.profile.university}.`);
      }

      // D: Reputation bonus
      if (candidate.profile.reputationScore >= 4.8) {
        matchPoints += 5;
      }

      const compatibilityScore = Math.min(Math.round(matchPoints), 99);

      // Only include candidates with meaningful match explanations or baseline matches
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
          reputationScore: candidate.profile.reputationScore,
          completedExchanges: candidate.profile.completedExchanges,
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
        explanations: explanations.length > 0 ? explanations : [`Compatible skill backgrounds in software development.`],
        matchedTeachingSkill: matchedTeachSkill,
        matchedLearningSkill: matchedLearnSkill,
      });
    }

    // Sort by compatibility score descending
    results.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

    return results.slice(0, limit);
  }
}
