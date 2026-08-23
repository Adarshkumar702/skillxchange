import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { ChatService } from '../services/chatService';
import { sendSuccess, sendError } from '../utils/responseFormatter';

const chatService = new ChatService();

export class ChatController {
  public async getConversations(req: AuthenticatedRequest, res: Response) {
    try {
      const conversations = await chatService.getUserConversations(req.user!.userId);
      return sendSuccess(res, 'Conversations fetched', conversations);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getMessages(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const page = parseInt(req.query.page as string || '1', 10);
      const messages = await chatService.getConversationMessages(req.user!.userId, id, page);
      return sendSuccess(res, 'Messages fetched', messages);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async sendMessage(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { content, mediaUrl } = req.body;
      const message = await chatService.sendMessage(req.user!.userId, id, content, mediaUrl);
      return sendSuccess(res, 'Message sent', message, 201);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }
}
