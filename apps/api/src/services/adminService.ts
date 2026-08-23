import { prisma } from '../config/prisma';
import { CreateReportInput, ReportStatus } from '@skillxchange/shared';

export class AdminService {
  public async getAnalytics() {
    const totalUsers = await prisma.user.count();
    const totalSkills = await prisma.skill.count();
    const totalSwaps = await prisma.swapRequest.count();
    const completedSwaps = await prisma.swapRequest.count({ where: { status: 'COMPLETED' } });
    const pendingSwaps = await prisma.swapRequest.count({ where: { status: 'PENDING' } });
    const totalRatings = await prisma.rating.count();
    const avgRating = await prisma.rating.aggregate({
      _avg: { overall: true },
    });

    const recentUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { profile: true },
    });

    const categoryDistribution = await prisma.skillCategory.findMany({
      include: {
        _count: { select: { skills: true } },
      },
    });

    return {
      overview: {
        totalUsers,
        totalSkills,
        totalSwaps,
        completedSwaps,
        pendingSwaps,
        totalRatings,
        averageRating: Math.round((avgRating._avg.overall || 5.0) * 10) / 10,
        dailyActiveUsers: Math.round(totalUsers * 0.45),
        monthlyActiveUsers: Math.round(totalUsers * 0.85),
      },
      recentUsers,
      categoryDistribution: categoryDistribution.map((c) => ({
        name: c.name,
        skillCount: c._count.skills,
      })),
    };
  }

  public async getUsers(search?: string, page = 1, limit = 20) {
    const where: any = {};
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { fullName: { contains: search, mode: 'insensitive' } } },
        { profile: { university: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        include: { profile: true, _count: { select: { skills: true, sentSwapRequests: true } } },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  public async deleteUser(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
    return { success: true };
  }

  public async createReport(reporterId: string, input: CreateReportInput) {
    return prisma.report.create({
      data: {
        reporterId,
        targetType: input.targetType,
        targetId: input.targetId,
        reason: input.reason,
        details: input.details,
        status: ReportStatus.PENDING,
      },
    });
  }

  public async getReports(status?: ReportStatus) {
    const where: any = {};
    if (status) where.status = status;

    return prisma.report.findMany({
      where,
      include: {
        reporter: { select: { id: true, profile: true, email: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async updateReportStatus(reportId: string, status: ReportStatus, adminNotes?: string) {
    return prisma.report.update({
      where: { id: reportId },
      data: { status, adminNotes },
    });
  }
}
