import { Router } from 'express';
import { UserController } from '../controllers/userController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/requestValidator';
import { ProfileUpdateSchema, UserSkillSchema } from '@skillxchange/shared';

const router = Router();
const userController = new UserController();

router.use(authenticate as any);

router.get('/profile', (req: any, res) => userController.getMyProfile(req, res));
router.put('/profile', validateBody(ProfileUpdateSchema), (req: any, res) => userController.updateProfile(req, res));
router.get('/:id', (req: any, res) => userController.getUserById(req, res));
router.post('/skills', validateBody(UserSkillSchema), (req: any, res) => userController.addUserSkill(req, res));
router.delete('/skills/:id', (req: any, res) => userController.removeUserSkill(req, res));

export default router;
