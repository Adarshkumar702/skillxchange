import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/requestValidator';
import { CreateSessionSchema } from '@skillxchange/shared';

const router = Router();
const sessionController = new SessionController();

router.use(authenticate as any);

router.post('/', validateBody(CreateSessionSchema), (req: any, res) => sessionController.createSession(req, res));
router.get('/', (req: any, res) => sessionController.getSessions(req, res));
router.put('/:id/status', (req: any, res) => sessionController.updateSessionStatus(req, res));

export default router;
