import { Router } from 'express';
import { AdminController } from '../controllers/adminController';
import { authenticate, authorizeRoles } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/requestValidator';
import { CreateReportSchema, UserRole } from '@skillxchange/shared';

const router = Router();
const adminController = new AdminController();

router.use(authenticate as any);

// User-facing report creation
router.post('/reports', validateBody(CreateReportSchema), (req: any, res) => adminController.createReport(req, res));

// Admin-only endpoints
router.use(authorizeRoles(UserRole.ADMIN) as any);

router.get('/analytics', (req: any, res) => adminController.getAnalytics(req, res));
router.get('/users', (req: any, res) => adminController.getUsers(req, res));
router.delete('/users/:id', (req: any, res) => adminController.deleteUser(req, res));
router.get('/reports', (req: any, res) => adminController.getReports(req, res));
router.put('/reports/:id', (req: any, res) => adminController.updateReportStatus(req, res));

export default router;
