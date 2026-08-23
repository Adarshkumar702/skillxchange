import { prisma } from '../config/prisma';

export class PlacementService {
  public async getPlacementReadiness(userId: string, roleTitle?: string) {
    let careerRole = null;
    if (roleTitle) {
      careerRole = await prisma.careerRole.findUnique({
        where: { title: roleTitle },
        include: { skills: { include: { skill: true } } },
      });
    }

    if (!careerRole) {
      careerRole = await prisma.careerRole.findFirst({
        include: { skills: { include: { skill: true } } },
      });
    }

    if (!careerRole) throw new Error('No career roles found in database');

    let record = await prisma.placementReadiness.findUnique({
      where: {
        userId_careerRoleId: { userId, careerRoleId: careerRole.id },
      },
      include: { careerRole: { include: { skills: { include: { skill: true } } } } },
    });

    if (!record) {
      // Calculate dynamic default based on user skills
      const userSkills = await prisma.userSkill.findMany({
        where: { userId },
        include: { skill: true },
      });

      const skillCount = userSkills.length;
      const dsaScore = Math.min(50 + skillCount * 5, 95);
      const systemDesignScore = Math.min(40 + skillCount * 4, 90);
      const techStackScore = Math.min(60 + skillCount * 6, 98);
      const softSkillsScore = 75;
      const overallScore = Math.round((dsaScore + systemDesignScore + techStackScore + softSkillsScore) / 4);

      record = await prisma.placementReadiness.create({
        data: {
          userId,
          careerRoleId: careerRole.id,
          dsaScore,
          systemDesignScore,
          techStackScore,
          softSkillsScore,
          overallScore,
        },
        include: { careerRole: { include: { skills: { include: { skill: true } } } } },
      });
    }

    return record;
  }

  public async updateReadinessScores(
    userId: string,
    careerRoleId: string,
    scores: { dsaScore?: number; systemDesignScore?: number; techStackScore?: number; softSkillsScore?: number }
  ) {
    const current = await prisma.placementReadiness.findUnique({
      where: { userId_careerRoleId: { userId, careerRoleId } },
    });

    const dsa = scores.dsaScore ?? current?.dsaScore ?? 60;
    const sys = scores.systemDesignScore ?? current?.systemDesignScore ?? 50;
    const tech = scores.techStackScore ?? current?.techStackScore ?? 70;
    const soft = scores.softSkillsScore ?? current?.softSkillsScore ?? 80;
    const overall = Math.round((dsa + sys + tech + soft) / 4);

    return prisma.placementReadiness.upsert({
      where: { userId_careerRoleId: { userId, careerRoleId } },
      update: {
        dsaScore: dsa,
        systemDesignScore: sys,
        techStackScore: tech,
        softSkillsScore: soft,
        overallScore: overall,
      },
      create: {
        userId,
        careerRoleId,
        dsaScore: dsa,
        systemDesignScore: sys,
        techStackScore: tech,
        softSkillsScore: soft,
        overallScore: overall,
      },
    });
  }

  public async getAvailableRoles() {
    return prisma.careerRole.findMany({
      include: {
        skills: { include: { skill: true } },
      },
      orderBy: { title: 'asc' },
    });
  }
}
