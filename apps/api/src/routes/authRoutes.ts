import { Router } from 'express';
import { AuthController } from '../controllers/authController';
import { validateBody } from '../middleware/requestValidator';
import { RegisterSchema, LoginSchema } from '@skillxchange/shared';

const router = Router();
const authController = new AuthController();

router.post('/register', validateBody(RegisterSchema), (req, res) => authController.register(req, res));
router.post('/login', validateBody(LoginSchema), (req, res) => authController.login(req, res));
router.post('/refresh', (req, res) => authController.refreshToken(req, res));
router.post('/logout', (req, res) => authController.logout(req, res));

export default router;
