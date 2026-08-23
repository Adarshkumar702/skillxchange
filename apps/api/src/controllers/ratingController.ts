import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { RatingService } from '../services/ratingService';
import { sendSuccess, sendError } from '../utils/responseFormatter';

const ratingService = new RatingService();

export class RatingController {
  public async createRating(req: AuthenticatedRequest, res: Response) {
    try {
      const rating = await ratingService.createRating(req.user!.userId, req.body);
      return sendSuccess(res, 'Rating submitted successfully', rating, 201);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getUserRatings(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.params.userId || req.user!.userId;
      const ratings = await ratingService.getUserRatings(userId);
      return sendSuccess(res, 'Ratings fetched', ratings);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }
}
