import { Router } from 'express';
import { PlacementController } from '../controllers/placementController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const placementController = new PlacementController();

router.use(authenticate as any);

router.get('/readiness', (req: any, res) => placementController.getReadiness(req, res));
router.put('/readiness', (req: any, res) => placementController.updateReadiness(req, res));
router.get('/roles', (req: any, res) => placementController.getCareerRoles(req, res));

export default router;
