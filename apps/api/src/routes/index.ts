import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import skillRoutes from './skillRoutes';
import matchingRoutes from './matchingRoutes';
import swapRoutes from './swapRoutes';
import chatRoutes from './chatRoutes';
import sessionRoutes from './sessionRoutes';
import ratingRoutes from './ratingRoutes';
import aiRoutes from './aiRoutes';
import placementRoutes from './placementRoutes';
import notificationRoutes from './notificationRoutes';
import adminRoutes from './adminRoutes';
import swaggerRoutes from './swagger';

const router = Router();

// Public Swagger API Documentation
router.use('/docs', swaggerRoutes);

// App Domain Routes
router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/skills', skillRoutes);
router.use('/matches', matchingRoutes);
router.use('/swaps', swapRoutes);
router.use('/conversations', chatRoutes);
router.use('/sessions', sessionRoutes);
router.use('/ratings', ratingRoutes);
router.use('/ai', aiRoutes);
router.use('/placement', placementRoutes);
router.use('/notifications', notificationRoutes);
router.use('/admin', adminRoutes);

export default router;
