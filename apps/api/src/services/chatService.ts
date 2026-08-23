import { prisma } from '../config/prisma';

export class ChatService {
  public async getUserConversations(userId: string) {
    return prisma.conversation.findMany({
      where: {
        members: { some: { userId } },
      },
      include: {
        swapRequest: {
          include: {
            offeredSkill: true,
            requestedSkill: true,
          },
        },
        members: {
          include: {
            user: { select: { id: true, profile: true } },
          },
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  }

  public async getConversationMessages(userId: string, conversationId: string, page = 1, limit = 50) {
    const isMember = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });

    if (!isMember) {
      throw new Error('Unauthorized access to conversation');
    }

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: { select: { id: true, profile: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Mark unread messages as read
    await prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });

    return messages.reverse();
  }

  public async sendMessage(userId: string, conversationId: string, content: string, mediaUrl?: string) {
    const isMember = await prisma.conversationMember.findUnique({
      where: { conversationId_userId: { conversationId, userId } },
    });

    if (!isMember) {
      throw new Error('Unauthorized to send message to conversation');
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: userId,
        content,
        mediaUrl,
      },
      include: {
        sender: { select: { id: true, profile: true } },
      },
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    return message;
  }
}
