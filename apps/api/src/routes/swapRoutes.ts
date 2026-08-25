import { Router } from 'express';
import { SwapController } from '../controllers/swapController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/requestValidator';
import { CreateSwapRequestSchema } from '@skillxchange/shared';

const router = Router();
const swapController = new SwapController();

router.use(authenticate as any);

router.post('/', validateBody(CreateSwapRequestSchema), (req: any, res) => swapController.createSwap(req, res));
router.get('/', (req: any, res) => swapController.getSwaps(req, res));
router.put('/:id/accept', (req: any, res) => swapController.acceptSwap(req, res));
router.put('/:id/reject', (req: any, res) => swapController.rejectSwap(req, res));
router.put('/:id/cancel', (req: any, res) => swapController.cancelSwap(req, res));
router.delete('/:id', (req: any, res) => swapController.deleteSwap(req, res));
router.put('/:id/complete', (req: any, res) => swapController.completeSwap(req, res));

export default router;
