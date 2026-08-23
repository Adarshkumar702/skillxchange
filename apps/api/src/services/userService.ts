import { prisma } from '../config/prisma';
import { ProfileUpdateInput, UserSkillInput } from '@skillxchange/shared';

export class UserService {
  public async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        createdAt: true,
        profile: true,
        skills: {
          include: { skill: { include: { category: true } } },
        },
        achievements: {
          include: { achievement: true },
        },
        _count: {
          select: {
            sentSwapRequests: true,
            receivedSwapRequests: true,
            givenRatings: true,
            receivedRatings: true,
          },
        },
      },
    });
    if (!user) throw new Error('User not found');
    return user;
  }

  public async updateProfile(userId: string, input: ProfileUpdateInput) {
    const profile = await prisma.profile.update({
      where: { userId },
      data: input,
    });
    return profile;
  }

  public async addUserSkill(userId: string, input: UserSkillInput) {
    const userSkill = await prisma.userSkill.upsert({
      where: {
        userId_skillId_type: {
          userId,
          skillId: input.skillId,
          type: input.type,
        },
      },
      update: {
        proficiency: input.proficiency,
        yearsExperience: input.yearsExperience,
      },
      create: {
        userId,
        skillId: input.skillId,
        type: input.type,
        proficiency: input.proficiency,
        yearsExperience: input.yearsExperience,
      },
      include: { skill: true },
    });

    // Check achievement trigger for first skill
    const skillCount = await prisma.userSkill.count({ where: { userId } });
    if (skillCount === 1) {
      const achievement = await prisma.achievement.findUnique({ where: { code: 'FIRST_SKILL' } });
      if (achievement) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId, achievementId: achievement.id } },
          create: { userId, achievementId: achievement.id },
          update: {},
        });
      }
    }

    return userSkill;
  }

  public async removeUserSkill(userId: string, userSkillId: string) {
    await prisma.userSkill.deleteMany({
      where: { id: userSkillId, userId },
    });
    return { success: true };
  }
}
