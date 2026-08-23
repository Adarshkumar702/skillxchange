import { Router } from 'express';
import { SkillController } from '../controllers/skillController';

const router = Router();
const skillController = new SkillController();

router.get('/categories', (req, res) => skillController.getCategories(req, res));
router.get('/', (req, res) => skillController.getSkills(req, res));
router.get('/:id', (req, res) => skillController.getSkillById(req, res));

export default router;
