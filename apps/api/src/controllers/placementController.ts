import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { PlacementService } from '../services/placementService';
import { sendSuccess, sendError } from '../utils/responseFormatter';

const placementService = new PlacementService();

export class PlacementController {
  public async getReadiness(req: AuthenticatedRequest, res: Response) {
    try {
      const roleTitle = req.query.role as string | undefined;
      const readiness = await placementService.getPlacementReadiness(req.user!.userId, roleTitle);
      return sendSuccess(res, 'Placement readiness score fetched', readiness);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async updateReadiness(req: AuthenticatedRequest, res: Response) {
    try {
      const { careerRoleId, scores } = req.body;
      const updated = await placementService.updateReadinessScores(req.user!.userId, careerRoleId, scores);
      return sendSuccess(res, 'Placement readiness updated', updated);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getCareerRoles(req: AuthenticatedRequest, res: Response) {
    try {
      const roles = await placementService.getAvailableRoles();
      return sendSuccess(res, 'Career roles fetched', roles);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }
}
