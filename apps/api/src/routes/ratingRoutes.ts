import { Router } from 'express';
import { RatingController } from '../controllers/ratingController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/requestValidator';
import { CreateRatingSchema } from '@skillxchange/shared';

const router = Router();
const ratingController = new RatingController();

router.use(authenticate as any);

router.post('/', validateBody(CreateRatingSchema), (req: any, res) => ratingController.createRating(req, res));
router.get('/user/:userId', (req: any, res) => ratingController.getUserRatings(req, res));
router.get('/my', (req: any, res) => ratingController.getUserRatings(req, res));

export default router;
