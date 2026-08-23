import { z } from 'zod';

// Roles & Enums
export enum UserRole {
  STUDENT = 'STUDENT',
  MENTOR = 'MENTOR',
  COMPANY = 'COMPANY',
  ADMIN = 'ADMIN',
}

export enum SkillType {
  TEACHING = 'TEACHING',
  LEARNING = 'LEARNING',
}

export enum ProficiencyLevel {
  BEGINNER = 'BEGINNER',
  INTERMEDIATE = 'INTERMEDIATE',
  ADVANCED = 'ADVANCED',
  EXPERT = 'EXPERT',
}

export enum SwapStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED',
  COMPLETED = 'COMPLETED',
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  REVIEWED = 'REVIEWED',
  RESOLVED = 'RESOLVED',
  DISMISSED = 'DISMISSED',
}

// Zod Schemas for Request Validation
export const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  university: z.string().min(2, 'University name is required'),
  course: z.string().min(2, 'Course name is required'),
  graduationYear: z.number().int().min(2020).max(2035),
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const ProfileUpdateSchema = z.object({
  fullName: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  university: z.string().optional(),
  course: z.string().optional(),
  graduationYear: z.number().optional(),
  location: z.string().optional(),
  githubUrl: z.string().url().or(z.literal('')).optional(),
  linkedinUrl: z.string().url().or(z.literal('')).optional(),
  portfolioUrl: z.string().url().or(z.literal('')).optional(),
  availability: z.string().optional(),
});

export const UserSkillSchema = z.object({
  skillId: z.string().uuid('Invalid skill ID'),
  type: z.nativeEnum(SkillType),
  proficiency: z.nativeEnum(ProficiencyLevel),
  yearsExperience: z.number().min(0).max(30).default(0),
});

export const CreateSwapRequestSchema = z.object({
  receiverId: z.string().uuid(),
  offeredSkillId: z.string().uuid(),
  requestedSkillId: z.string().uuid(),
  message: z.string().min(5, 'Message must be at least 5 characters').max(500),
});

export const CreateSessionSchema = z.object({
  swapRequestId: z.string().uuid(),
  title: z.string().min(3).max(100),
  description: z.string().max(500).optional(),
  scheduledAt: z.string().datetime(),
  durationMinutes: z.number().min(15).max(240).default(60),
  meetingUrl: z.string().url().or(z.literal('')).optional(),
});

export const CreateRatingSchema = z.object({
  swapRequestId: z.string().uuid(),
  rateeId: z.string().uuid(),
  overall: z.number().min(1).max(5),
  teachingQuality: z.number().min(1).max(5),
  communication: z.number().min(1).max(5),
  reliability: z.number().min(1).max(5),
  knowledge: z.number().min(1).max(5),
  feedback: z.string().max(500).optional(),
});

export const CreateReportSchema = z.object({
  targetType: z.enum(['USER', 'MESSAGE', 'SWAP', 'SKILL']),
  targetId: z.string().uuid(),
  reason: z.enum(['SPAM', 'HARASSMENT', 'FAKE_PROFILE', 'SCAM', 'INAPPROPRIATE_CONTENT', 'OTHER']),
  details: z.string().max(1000).optional(),
});

export const SkillGapAnalysisSchema = z.object({
  targetRoleTitle: z.string().min(2),
});

export const CareerRoadmapSchema = z.object({
  targetRoleTitle: z.string().min(2),
  timelineDays: z.number().min(7).max(365).default(30),
});

export const AIChatSchema = z.object({
  message: z.string().min(1).max(1000),
  conversationHistory: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string(),
  })).optional(),
});

// Standard API Response Wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type ProfileUpdateInput = z.infer<typeof ProfileUpdateSchema>;
export type UserSkillInput = z.infer<typeof UserSkillSchema>;
export type CreateSwapRequestInput = z.infer<typeof CreateSwapRequestSchema>;
export type CreateSessionInput = z.infer<typeof CreateSessionSchema>;
export type CreateRatingInput = z.infer<typeof CreateRatingSchema>;
export type CreateReportInput = z.infer<typeof CreateReportSchema>;
