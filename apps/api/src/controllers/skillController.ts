import { Request, Response } from 'express';
import { SkillService } from '../services/skillService';
import { sendSuccess, sendError } from '../utils/responseFormatter';

const skillService = new SkillService();

export class SkillController {
  public async getCategories(req: Request, res: Response) {
    try {
      const categories = await skillService.getCategories();
      return sendSuccess(res, 'Skill categories fetched', categories);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getSkills(req: Request, res: Response) {
    try {
      const { search, categoryId } = req.query;
      const skills = await skillService.getAllSkills(
        search as string,
        categoryId as string
      );
      return sendSuccess(res, 'Skills fetched', skills);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getSkillById(req: Request, res: Response) {
    try {
      const skill = await skillService.getSkillById(req.params.id);
      return sendSuccess(res, 'Skill details fetched', skill);
    } catch (err: any) {
      return sendError(res, err.message, [], 404);
    }
  }
}
