import { prisma } from '../config/prisma';
import { CreateSwapRequestInput, SwapStatus, SkillType, SessionStatus } from '@skillxchange/shared';

export class SwapService {
  public async createSwapRequest(senderId: string, input: CreateSwapRequestInput) {
    if (senderId === input.receiverId) {
      throw new Error('Cannot send a swap request to yourself');
    }

    // Check duplicate pending/accepted requests
    const existing = await prisma.swapRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId: input.receiverId, status: { in: [SwapStatus.PENDING, SwapStatus.ACCEPTED] } },
          { senderId: input.receiverId, receiverId: senderId, status: { in: [SwapStatus.PENDING, SwapStatus.ACCEPTED] } },
        ],
      },
    });

    if (existing) {
      throw new Error('An active swap request already exists between you and this user');
    }

    // Validate that sender possesses offered skill
    const senderSkill = await prisma.userSkill.findFirst({
      where: { userId: senderId, skillId: input.offeredSkillId, type: SkillType.TEACHING },
    });
    if (!senderSkill) {
      throw new Error('You can only offer a skill listed under your teaching skills');
    }

    // Create Swap Request
    const swap = await prisma.swapRequest.create({
      data: {
        senderId,
        receiverId: input.receiverId,
        offeredSkillId: input.offeredSkillId,
        requestedSkillId: input.requestedSkillId,
        message: input.message,
        status: SwapStatus.PENDING,
      },
      include: {
        sender: { select: { id: true, profile: true } },
        receiver: { select: { id: true, profile: true } },
        offeredSkill: true,
        requestedSkill: true,
      },
    });

    // Notify Receiver
    await prisma.notification.create({
      data: {
        userId: input.receiverId,
        type: 'SWAP_REQUEST',
        title: 'New Skill Swap Request!',
        message: `${swap.sender.profile?.fullName} sent you a swap request: Teach ${swap.requestedSkill.name} for ${swap.offeredSkill.name}`,
        linkUrl: `/dashboard/swaps`,
      },
    });

    return swap;
  }

  public async getSwapsForUser(userId: string, status?: SwapStatus) {
    const where: any = {
      OR: [{ senderId: userId }, { receiverId: userId }],
    };
    if (status) {
      where.status = status;
    }

    return prisma.swapRequest.findMany({
      where,
      include: {
        sender: { select: { id: true, profile: true } },
        receiver: { select: { id: true, profile: true } },
        offeredSkill: true,
        requestedSkill: true,
        learningProgress: true,
        conversation: { select: { id: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  public async acceptSwapRequest(userId: string, swapId: string) {
    const swap = await prisma.swapRequest.findUnique({
      where: { id: swapId },
      include: { sender: { select: { profile: true } }, receiver: { select: { profile: true } } },
    });

    if (!swap || swap.receiverId !== userId) {
      throw new Error('Swap request not found or unauthorized');
    }

    if (swap.status !== SwapStatus.PENDING) {
      throw new Error(`Cannot accept request in status ${swap.status}`);
    }

    // 1. Update status
    const updated = await prisma.swapRequest.update({
      where: { id: swapId },
      data: { status: SwapStatus.ACCEPTED },
    });

    // 2. Create conversation
    const conversation = await prisma.conversation.create({
      data: {
        swapRequestId: swapId,
        members: {
          create: [{ userId: swap.senderId }, { userId: swap.receiverId }],
        },
      },
    });

    // 3. Create initial learning progress
    await prisma.learningProgress.create({
      data: {
        swapRequestId: swapId,
        percentage: 0.0,
        sessionsCompleted: 0,
        totalSessions: 5,
        notes: 'Exchange initiated! Schedule your first learning session to start progress.',
      },
    });

    // 4. Notify sender
    await prisma.notification.create({
      data: {
        userId: swap.senderId,
        type: 'SWAP_ACCEPTED',
        title: 'Swap Request Accepted!',
        message: `${swap.receiver.profile?.fullName} accepted your swap request! You can now chat and schedule learning sessions.`,
        linkUrl: `/dashboard/chat?conversationId=${conversation.id}`,
      },
    });

    return { swap: updated, conversationId: conversation.id };
  }

  public async rejectSwapRequest(userId: string, swapId: string) {
    const swap = await prisma.swapRequest.findUnique({ where: { id: swapId } });
    if (!swap || swap.receiverId !== userId) {
      throw new Error('Swap request not found or unauthorized');
    }

    const updated = await prisma.swapRequest.update({
      where: { id: swapId },
      data: { status: SwapStatus.REJECTED },
    });

    await prisma.notification.create({
      data: {
        userId: swap.senderId,
        type: 'SWAP_REJECTED',
        title: 'Swap Request Update',
        message: `Your swap request was declined. Explore other compatible matches!`,
        linkUrl: `/dashboard/discover`,
      },
    });

    return updated;
  }

  public async cancelSwapRequest(userId: string, swapId: string) {
    const swap = await prisma.swapRequest.findUnique({ where: { id: swapId } });
    if (!swap || (swap.senderId !== userId && swap.receiverId !== userId)) {
      throw new Error('Swap request not found or unauthorized');
    }

    const updated = await prisma.swapRequest.update({
      where: { id: swapId },
      data: { status: SwapStatus.CANCELLED },
    });

    // Mark sessions cancelled
    await prisma.learningSession.updateMany({
      where: { swapRequestId: swapId, status: SessionStatus.SCHEDULED },
      data: { status: SessionStatus.CANCELLED },
    });

    return updated;
  }

  public async deleteSwapRequest(userId: string, swapId: string) {
    const swap = await prisma.swapRequest.findUnique({ where: { id: swapId } });
    if (!swap || (swap.senderId !== userId && swap.receiverId !== userId)) {
      throw new Error('Swap request not found or unauthorized');
    }

    await prisma.swapRequest.delete({
      where: { id: swapId },
    });

    return { success: true };
  }

  public async completeSwapExchange(userId: string, swapId: string) {
    const swap = await prisma.swapRequest.findUnique({
      where: { id: swapId },
    });

    if (!swap || (swap.senderId !== userId && swap.receiverId !== userId)) {
      throw new Error('Swap request not found or unauthorized');
    }

    const updated = await prisma.swapRequest.update({
      where: { id: swapId },
      data: { status: SwapStatus.COMPLETED },
    });

    // Automatically mark all remaining scheduled sessions as COMPLETED for this swap
    await prisma.learningSession.updateMany({
      where: { swapRequestId: swapId, status: SessionStatus.SCHEDULED },
      data: { status: SessionStatus.COMPLETED },
    });

    // Update completed exchanges counter for both users
    await prisma.profile.updateMany({
      where: { userId: { in: [swap.senderId, swap.receiverId] } },
      data: { completedExchanges: { increment: 1 } },
    });

    // Send rating reminders to both
    const otherUserId = swap.senderId === userId ? swap.receiverId : swap.senderId;
    await prisma.notification.create({
      data: {
        userId: otherUserId,
        type: 'EXCHANGE_COMPLETED',
        title: 'Skill Exchange Completed!',
        message: `Your exchange has been completed! Please rate your learning experience.`,
        linkUrl: `/dashboard/ratings`,
      },
    });

    return updated;
  }
}
