import { Router } from 'express';
import { ChatController } from '../controllers/chatController';
import { authenticate } from '../middleware/authMiddleware';

const router = Router();
const chatController = new ChatController();

router.use(authenticate as any);

router.get('/conversations', (req: any, res) => chatController.getConversations(req, res));
router.get('/conversations/:id/messages', (req: any, res) => chatController.getMessages(req, res));
router.post('/conversations/:id/messages', (req: any, res) => chatController.sendMessage(req, res));

export default router;
