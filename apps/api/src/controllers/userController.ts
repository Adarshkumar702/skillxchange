import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { UserService } from '../services/userService';
import { sendSuccess, sendError } from '../utils/responseFormatter';

const userService = new UserService();

export class UserController {
  public async getMyProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await userService.getProfile(req.user!.userId);
      return sendSuccess(res, 'User profile fetched', profile);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getUserById(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await userService.getProfile(req.params.id);
      return sendSuccess(res, 'User profile fetched', profile);
    } catch (err: any) {
      return sendError(res, err.message, [], 404);
    }
  }

  public async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const profile = await userService.updateProfile(req.user!.userId, req.body);
      return sendSuccess(res, 'Profile updated successfully', profile);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async addUserSkill(req: AuthenticatedRequest, res: Response) {
    try {
      const userSkill = await userService.addUserSkill(req.user!.userId, req.body);
      return sendSuccess(res, 'Skill added to profile', userSkill, 201);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async removeUserSkill(req: AuthenticatedRequest, res: Response) {
    try {
      await userService.removeUserSkill(req.user!.userId, req.params.id);
      return sendSuccess(res, 'Skill removed from profile', null);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }
}
