import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { AIService } from '../ai/AIService';
import { prisma } from '../config/prisma';
import { sendSuccess, sendError } from '../utils/responseFormatter';

export class AIController {
  public async getSkillRecommendations(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: {
          profile: true,
          skills: { include: { skill: true } },
        },
      });

      if (!user || !user.profile) throw new Error('User profile not found');

      const teaching = user.skills.filter((s) => s.type === 'TEACHING').map((s) => s.skill.name);
      const learning = user.skills.filter((s) => s.type === 'LEARNING').map((s) => s.skill.name);

      const ai = AIService.getInstance();
      const recs = await ai.recommendSkills({
        fullName: user.profile.fullName,
        teachingSkills: teaching,
        learningSkills: learning,
        course: user.profile.course,
      });

      return sendSuccess(res, 'AI skill recommendations generated', recs);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async analyzeSkillGap(req: AuthenticatedRequest, res: Response) {
    try {
      const { targetRoleTitle } = req.body;
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { skills: { include: { skill: true } } },
      });

      const currentSkills = user?.skills.map((s) => s.skill.name) || [];
      const ai = AIService.getInstance();
      const result = await ai.analyzeSkillGap({ currentSkills, targetRoleTitle });

      return sendSuccess(res, 'Skill gap analysis completed', result);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async getCareerRoadmap(req: AuthenticatedRequest, res: Response) {
    try {
      const { targetRoleTitle, timelineDays } = req.body;
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: { skills: { include: { skill: true } } },
      });

      const currentSkills = user?.skills.map((s) => s.skill.name) || [];
      const ai = AIService.getInstance();
      const roadmap = await ai.generateCareerRoadmap({
        currentSkills,
        targetRoleTitle,
        timelineDays: timelineDays || 30,
      });

      return sendSuccess(res, 'AI career roadmap generated', roadmap);
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }

  public async careerChat(req: AuthenticatedRequest, res: Response) {
    try {
      const { message, conversationHistory } = req.body;
      const user = await prisma.user.findUnique({
        where: { id: req.user!.userId },
        include: {
          profile: true,
          skills: { include: { skill: true } },
        },
      });

      if (!user || !user.profile) throw new Error('User profile not found');

      const skills = user.skills.map((s) => s.skill.name);
      const ai = AIService.getInstance();
      const response = await ai.careerChat(
        {
          fullName: user.profile.fullName,
          university: user.profile.university,
          course: user.profile.course,
          skills,
        },
        message,
        conversationHistory
      );

      return sendSuccess(res, 'AI response generated', { reply: response });
    } catch (err: any) {
      return sendError(res, err.message, [], 400);
    }
  }
}
