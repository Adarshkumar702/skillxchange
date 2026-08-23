import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { NotificationService } from '../services/notificationService';
import { sendSuccess, sendError } from '../utils/responseFormatter';

const notificationService = new NotificationService();

export class NotificationController {
  public async getNotifications(req: AuthenticatedRequest, res: Response) {
    try {
      const notifications = await notificationService.getUserNotifications(req.user!.userId);
      return sendSuccess(res, 'Notifications fetched', notifications);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async markAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      await notificationService.markAsRead(req.user!.userId, req.params.id);
      return sendSuccess(res, 'Notification marked as read', null);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async markAllAsRead(req: AuthenticatedRequest, res: Response) {
    try {
      await notificationService.markAllAsRead(req.user!.userId);
      return sendSuccess(res, 'All notifications marked as read', null);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }
}
