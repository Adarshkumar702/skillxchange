import { Router } from 'express';
import { AIController } from '../controllers/aiController';
import { authenticate } from '../middleware/authMiddleware';
import { validateBody } from '../middleware/requestValidator';
import { SkillGapAnalysisSchema, CareerRoadmapSchema, AIChatSchema } from '@skillxchange/shared';

const router = Router();
const aiController = new AIController();

router.use(authenticate as any);

router.post('/recommend-skills', (req: any, res) => aiController.getSkillRecommendations(req, res));
router.post('/analyze-skill-gap', validateBody(SkillGapAnalysisSchema), (req: any, res) => aiController.analyzeSkillGap(req, res));
router.post('/career-roadmap', validateBody(CareerRoadmapSchema), (req: any, res) => aiController.getCareerRoadmap(req, res));
router.post('/chat', validateBody(AIChatSchema), (req: any, res) => aiController.careerChat(req, res));

export default router;
