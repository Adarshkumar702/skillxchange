import { prisma } from '../config/prisma';

export class SkillService {
  public async getCategories() {
    return prisma.skillCategory.findMany({
      include: {
        _count: { select: { skills: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  public async getAllSkills(search?: string, categoryId?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (categoryId) {
      where.categoryId = categoryId;
    }

    return prisma.skill.findMany({
      where,
      include: {
        category: true,
        _count: { select: { userSkills: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  public async getSkillById(id: string) {
    const skill = await prisma.skill.findUnique({
      where: { id },
      include: {
        category: true,
        userSkills: {
          include: {
            user: { select: { id: true, profile: true } },
          },
          take: 10,
        },
      },
    });
    if (!skill) throw new Error('Skill not found');
    return skill;
  }
}
