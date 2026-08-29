import { prisma } from '../config/prisma';
import { CreateSessionInput, SessionStatus, SwapStatus } from '@skillxchange/shared';

export class SessionService {
  public async createSession(userId: string, input: CreateSessionInput) {
    const swap = await prisma.swapRequest.findUnique({
      where: { id: input.swapRequestId },
    });

    if (!swap || (swap.senderId !== userId && swap.receiverId !== userId)) {
      throw new Error('Unauthorized or invalid swap request');
    }

    if (swap.status !== SwapStatus.ACCEPTED) {
      throw new Error(`Cannot schedule session for a swap in status ${swap.status}. Swap must be ACCEPTED.`);
    }

    // Deterministic room name derived from swapRequestId to guarantee both users join exact same room
    const cleanSwapId = input.swapRequestId.replace(/[^a-zA-Z0-9]/g, '');
    const defaultMeetingUrl = `https://jitsi.riot.im/SkillXchange_Room_${cleanSwapId}#config.prejoinPageEnabled=false&config.enableLobby=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.requireDisplayName=false&config.disableDeepLinking=true&config.chat={"position":"right"}&config.participantsPane={"enabled":true}&config.toolbarButtons=["microphone","camera","desktop","chat","raisehand","participants-pane","tileview","fullscreen","hangup"]`;

    const session = await prisma.learningSession.create({
      data: {
        swapRequestId: input.swapRequestId,
        createdById: userId,
        title: input.title,
        description: input.description,
        scheduledAt: new Date(input.scheduledAt),
        durationMinutes: input.durationMinutes,
        meetingUrl: input.meetingUrl || defaultMeetingUrl,
        status: SessionStatus.SCHEDULED,
      },
      include: { createdBy: { select: { profile: true } } },
    });

    // Notify other member
    const targetUserId = swap.senderId === userId ? swap.receiverId : swap.senderId;
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        type: 'SESSION_REMINDER',
        title: 'New Learning Session Scheduled!',
        message: `Session "${session.title}" scheduled for ${new Date(input.scheduledAt).toLocaleDateString()}`,
        linkUrl: `/dashboard/sessions`,
      },
    });

    return session;
  }

  public async getSessionsForUser(userId: string) {
    return prisma.learningSession.findMany({
      where: {
        swapRequest: {
          OR: [{ senderId: userId }, { receiverId: userId }],
        },
      },
      include: {
        swapRequest: {
          include: {
            offeredSkill: true,
            requestedSkill: true,
            sender: { select: { id: true, profile: true } },
            receiver: { select: { id: true, profile: true } },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  public async updateSessionStatus(userId: string, sessionId: string, status: SessionStatus) {
    const session = await prisma.learningSession.findUnique({
      where: { id: sessionId },
      include: { swapRequest: true },
    });

    if (!session || (session.swapRequest.senderId !== userId && session.swapRequest.receiverId !== userId)) {
      throw new Error('Unauthorized or session not found');
    }

    const updated = await prisma.learningSession.update({
      where: { id: sessionId },
      data: { status },
    });

    // If completed, update learning progress percentage automatically
    if (status === SessionStatus.COMPLETED) {
      const completedCount = await prisma.learningSession.count({
        where: { swapRequestId: session.swapRequestId, status: SessionStatus.COMPLETED },
      });

      const total = 5; // default target
      const percentage = Math.min(Math.round((completedCount / total) * 100), 100);

      await prisma.learningProgress.upsert({
        where: { swapRequestId: session.swapRequestId },
        update: {
          sessionsCompleted: completedCount,
          percentage,
        },
        create: {
          swapRequestId: session.swapRequestId,
          sessionsCompleted: completedCount,
          totalSessions: total,
          percentage,
        },
      });
    }

    return updated;
  }
}
