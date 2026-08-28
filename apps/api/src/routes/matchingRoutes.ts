import { Router, Response } from 'express';
import { authenticate, AuthenticatedRequest } from '../middleware/authMiddleware';
import { MatchingService } from '../services/matchingService';
import { sendSuccess, sendError } from '../utils/responseFormatter';

const router = Router();
const matchingService = new MatchingService();

router.use(authenticate as any);

router.get('/recommended', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const university = req.query.university as string | undefined;
    const search = req.query.search as string | undefined;
    const skillId = req.query.skillId as string | undefined;
    const minRating = req.query.minRating ? parseFloat(req.query.minRating as string) : undefined;
    const onlyRealUsers = req.query.onlyRealUsers === 'true';

    const matches = await matchingService.getMatchesForUser(req.user!.userId, 20, {
      university,
      search,
      skillId,
      minRating,
      onlyRealUsers,
    });
    return sendSuccess(res, 'Recommended matches generated', matches);
  } catch (err: any) {
    return sendError(res, err.message, [], 400);
  }
});

export default router;
