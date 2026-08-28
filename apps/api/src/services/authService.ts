import { prisma } from '../config/prisma';
import { hashPassword, comparePassword } from '../utils/password';
import { generateAccessToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { RegisterInput, LoginInput, UserRole } from '@skillxchange/shared';

export class AuthService {
  public async register(input: RegisterInput) {
    const existing = await prisma.user.findUnique({ where: { email: input.email } });
    if (existing) {
      throw new Error('User with this email already exists');
    }

    const passwordHash = await hashPassword(input.password);

    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        role: UserRole.STUDENT,
        isVerified: true, // Real user registered via /register is Verified
        profile: {
          create: {
            fullName: input.fullName,
            university: input.university,
            course: input.course,
            graduationYear: input.graduationYear,
            avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(input.fullName)}`,
          },
        },
      },
      include: {
        profile: true,
        skills: { include: { skill: { include: { category: true } } } },
      },
    });

    // Create default welcome notification
    await prisma.notification.create({
      data: {
        userId: user.id,
        type: 'AI_RECOMMENDATION',
        title: 'Welcome to SkillXchange!',
        message: 'Add skills you want to teach and learn to get AI matches!',
        linkUrl: '/dashboard/profile',
      },
    });

    const tokenPayload = { userId: user.id, email: user.email, role: user.role as unknown as UserRole };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    // Save refresh token
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
        skills: user.skills,
      },
      accessToken,
      refreshToken,
    };
  }

  public async login(input: LoginInput) {
    const cleanEmail = input.email.trim().toLowerCase();

    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        profile: true,
        skills: { include: { skill: { include: { category: true } } } },
      },
    });

    // Auto-provision and sync Admin Account (admin@adarsh.com / 1234)
    if (cleanEmail === 'admin@adarsh.com' || cleanEmail === 'admin@example.com') {
      const targetPassword = cleanEmail === 'admin@adarsh.com' ? '1234' : 'admin123';

      if (!user) {
        const passwordHash = await hashPassword(targetPassword);
        user = await prisma.user.create({
          data: {
            email: cleanEmail,
            passwordHash,
            role: UserRole.ADMIN,
            isVerified: true,
            profile: {
              create: {
                fullName: 'Adarsh (Project Owner & Admin)',
                university: 'SkillXchange Administration',
                course: 'Platform Owner & Administrator',
                graduationYear: 2024,
                location: 'India',
                bio: 'Project Owner and Administrator with full access control.',
                avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=AdminOwner',
              },
            },
          },
          include: {
            profile: true,
            skills: { include: { skill: { include: { category: true } } } },
          },
        });
      } else {
        // If user already exists in DB, ensure input password (e.g. 1234) updates passwordHash if needed
        const isValidPassword = await comparePassword(input.password, user.passwordHash);
        if (!isValidPassword && (input.password === '1234' || input.password === 'admin123')) {
          const newHash = await hashPassword(input.password);
          user = await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash: newHash, role: UserRole.ADMIN, isVerified: true },
            include: {
              profile: true,
              skills: { include: { skill: { include: { category: true } } } },
            },
          });
        }
      }
    }

    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isValid = await comparePassword(input.password, user.passwordHash);
    if (!isValid) {
      throw new Error('Invalid email or password');
    }

    const tokenPayload = { userId: user.id, email: user.email, role: user.role as unknown as UserRole };
    const accessToken = generateAccessToken(tokenPayload);
    const refreshToken = generateRefreshToken(tokenPayload);

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await prisma.refreshToken.create({
      data: { token: refreshToken, userId: user.id, expiresAt },
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified,
        profile: user.profile,
        skills: user.skills,
      },
      accessToken,
      refreshToken,
    };
  }

  public async refreshToken(token: string) {
    const payload = verifyRefreshToken(token);
    const saved = await prisma.refreshToken.findUnique({ where: { token } });
    if (!saved || saved.expiresAt < new Date()) {
      throw new Error('Invalid or expired refresh token');
    }

    const newAccessToken = generateAccessToken({ userId: payload.userId, email: payload.email, role: payload.role as unknown as UserRole });
    return { accessToken: newAccessToken };
  }

  public async logout(refreshToken: string) {
    if (refreshToken) {
      await prisma.refreshToken.deleteMany({ where: { token: refreshToken } });
    }
  }
}
