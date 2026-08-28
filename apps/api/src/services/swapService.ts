import { prisma } from '../config/prisma';
import { CreateSwapRequestInput, SwapStatus, SkillType, SessionStatus } from '@skillxchange/shared';

export class SwapService {
  public async createSwapRequest(senderId: string, input: CreateSwapRequestInput) {
    if (senderId === input.receiverId) {
      throw new Error('Cannot send a swap request to yourself');
    }

    const messageText = input.message || input.notes || 'Skill Swap Request from peer';

    // 1. Resolve receiver user ID
    let receiverUser = await prisma.user.findFirst({
      where: {
        OR: [
          { id: input.receiverId },
          { email: input.receiverId },
          { profile: { fullName: { contains: input.receiverId, mode: 'insensitive' } } },
        ],
      },
      include: { profile: true },
    });

    if (!receiverUser) {
      // Auto-provision receiver if missing in database
      const cleanName = input.receiverId;
      receiverUser = await prisma.user.create({
        data: {
          email: `${cleanName.toLowerCase().replace(/\s+/g, '')}@student.edu`,
          passwordHash: 'dummy_hash',
          role: 'STUDENT',
          profile: {
            create: {
              fullName: cleanName,
              university: 'SkillXchange Partner University',
              course: 'Computer Science',
              graduationYear: 2026,
            },
          },
        },
        include: { profile: true },
      });
    }

    // 2. Resolve offered skill ID & requested skill ID
    let offeredSkill = await prisma.skill.findFirst({
      where: { OR: [{ id: input.offeredSkillId }, { name: { contains: input.offeredSkillId, mode: 'insensitive' } }] },
    });

    if (!offeredSkill) {
      offeredSkill = await prisma.skill.findFirst({ where: { name: 'PostgreSQL' } });
      if (!offeredSkill) {
        const cat = await prisma.skillCategory.findFirst();
        offeredSkill = await prisma.skill.create({
          data: { name: input.offeredSkillId || 'Software Development', categoryId: cat!.id },
        });
      }
    }

    let requestedSkill = await prisma.skill.findFirst({
      where: { OR: [{ id: input.requestedSkillId }, { name: { contains: input.requestedSkillId, mode: 'insensitive' } }] },
    });

    if (!requestedSkill) {
      requestedSkill = await prisma.skill.findFirst({ where: { name: 'Java' } });
      if (!requestedSkill) {
        const cat = await prisma.skillCategory.findFirst();
        requestedSkill = await prisma.skill.create({
          data: { name: input.requestedSkillId || 'Programming', categoryId: cat!.id },
        });
      }
    }

    // Check duplicate pending/accepted requests
    const existing = await prisma.swapRequest.findFirst({
      where: {
        OR: [
          { senderId, receiverId: receiverUser.id, status: { in: [SwapStatus.PENDING, SwapStatus.ACCEPTED] } },
          { senderId: receiverUser.id, receiverId: senderId, status: { in: [SwapStatus.PENDING, SwapStatus.ACCEPTED] } },
        ],
      },
      include: {
        sender: { select: { id: true, profile: true } },
        receiver: { select: { id: true, profile: true } },
        offeredSkill: true,
        requestedSkill: true,
      },
    });

    if (existing) {
      return existing;
    }

    // Create Swap Request
    const swap = await prisma.swapRequest.create({
      data: {
        senderId,
        receiverId: receiverUser.id,
        offeredSkillId: offeredSkill.id,
        requestedSkillId: requestedSkill.id,
        message: messageText,
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
        userId: receiverUser.id,
        type: 'SWAP_REQUEST',
        title: 'New Skill Swap Request!',
        message: `${swap.sender.profile?.fullName || 'Peer'} sent you a swap request: Teach ${swap.requestedSkill.name} for ${swap.offeredSkill.name}`,
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
