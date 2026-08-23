import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { SessionService } from '../services/sessionService';
import { sendSuccess, sendError } from '../utils/responseFormatter';
import { SessionStatus } from '@skillxchange/shared';

const sessionService = new SessionService();

export class SessionController {
  public async createSession(req: AuthenticatedRequest, res: Response) {
    try {
      const session = await sessionService.createSession(req.user!.userId, req.body);
      return sendSuccess(res, 'Session scheduled successfully', session, 201);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const sessions = await sessionService.getSessionsForUser(req.user!.userId);
      return sendSuccess(res, 'Learning sessions fetched', sessions);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async updateSessionStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body as { status: SessionStatus };
      const updated = await sessionService.updateSessionStatus(req.user!.userId, id, status);
      return sendSuccess(res, 'Session status updated', updated);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }
}
