import { prisma } from '../config/prisma';
import { CreateRatingInput } from '@skillxchange/shared';

export class RatingService {
  public async createRating(raterId: string, input: CreateRatingInput) {
    if (raterId === input.rateeId) {
      throw new Error('Cannot rate yourself');
    }

    const swap = await prisma.swapRequest.findUnique({
      where: { id: input.swapRequestId },
    });

    if (!swap || (swap.senderId !== raterId && swap.receiverId !== raterId)) {
      throw new Error('Unauthorized or swap request not found');
    }

    // Check duplicate rating
    const existing = await prisma.rating.findUnique({
      where: {
        swapRequestId_raterId: { swapRequestId: input.swapRequestId, raterId },
      },
    });

    if (existing) {
      throw new Error('You have already submitted a rating for this exchange');
    }

    // 1. Create rating
    const rating = await prisma.rating.create({
      data: {
        swapRequestId: input.swapRequestId,
        raterId,
        rateeId: input.rateeId,
        overall: input.overall,
        teachingQuality: input.teachingQuality,
        communication: input.communication,
        reliability: input.reliability,
        knowledge: input.knowledge,
        feedback: input.feedback,
      },
    });

    // 2. Recalculate ratee profile reputation score
    const allRatings = await prisma.rating.findMany({
      where: { rateeId: input.rateeId },
    });

    const avgReputation =
      allRatings.reduce((acc, curr) => acc + curr.overall, 0) / Math.max(allRatings.length, 1);

    await prisma.profile.update({
      where: { userId: input.rateeId },
      data: { reputationScore: Math.round(avgReputation * 10) / 10 },
    });

    // 3. Notify ratee
    await prisma.notification.create({
      data: {
        userId: input.rateeId,
        type: 'RATING_RECEIVED',
        title: 'New Rating & Review Received!',
        message: `You received a ${input.overall}★ rating for your recent skill exchange!`,
        linkUrl: `/dashboard/ratings`,
      },
    });

    // 4. Achievement checks
    if (allRatings.length >= 1) {
      const ach = await prisma.achievement.findUnique({ where: { code: 'FIRST_EXCHANGE' } });
      if (ach) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: input.rateeId, achievementId: ach.id } },
          create: { userId: input.rateeId, achievementId: ach.id },
          update: {},
        });
      }
    }
    if (avgReputation >= 4.8 && allRatings.length >= 3) {
      const ach = await prisma.achievement.findUnique({ where: { code: 'TOP_TEACHER' } });
      if (ach) {
        await prisma.userAchievement.upsert({
          where: { userId_achievementId: { userId: input.rateeId, achievementId: ach.id } },
          create: { userId: input.rateeId, achievementId: ach.id },
          update: {},
        });
      }
    }

    return rating;
  }

  public async getUserRatings(userId: string) {
    return prisma.rating.findMany({
      where: { rateeId: userId },
      include: {
        rater: { select: { id: true, profile: true } },
        swapRequest: {
          include: { offeredSkill: true, requestedSkill: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
