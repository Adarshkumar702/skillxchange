import { Router } from 'express';
import { NotificationController } from '../controllers/notificationController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const notificationController = new NotificationController();

router.use(authenticate as any);

router.get('/', (req: any, res) => notificationController.getNotifications(req, res));
router.put('/:id/read', (req: any, res) => notificationController.markAsRead(req, res));
router.put('/read-all', (req: any, res) => notificationController.markAllAsRead(req, res));

export default router;
