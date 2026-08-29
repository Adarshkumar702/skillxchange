import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config();

import { PrismaClient, Role, SkillType, ProficiencyLevel, SwapStatus, TargetRoleImportance } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SkillXchange Database Seeding...');

  // Clean existing database
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User", "Profile", "SkillCategory", "Skill", "UserSkill", "SwapRequest", "Conversation", "ConversationMember", "Message", "LearningSession", "LearningProgress", "Rating", "Achievement", "UserAchievement", "Notification", "Report", "CareerRole", "CareerRoleSkill", "AiRecommendation", "PlacementReadiness", "RefreshToken" CASCADE;');

  const seedAdminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@skillxchange.com';
  const seedAdminPassword = process.env.SEED_ADMIN_PASSWORD || 'AdminPassword123!';

  const hashedStudentPassword = await bcrypt.hash('password123', 10);
  const hashedAdminPassword = await bcrypt.hash(seedAdminPassword, 10);

  // 1. Achievements
  console.log('  -> Seeding Achievements...');
  const achievements = await Promise.all([
    prisma.achievement.create({
      data: { code: 'FIRST_SKILL', title: 'Skill Pioneer', description: 'Added your first skill to teach or learn.', icon: 'Zap', badgeColor: 'indigo' },
    }),
    prisma.achievement.create({
      data: { code: 'FIRST_EXCHANGE', title: 'Skill Swap Initiator', description: 'Completed your first skill exchange.', icon: 'Repeat', badgeColor: 'cyan' },
    }),
    prisma.achievement.create({
      data: { code: 'TOP_TEACHER', title: 'Top-Rated Mentor', description: 'Maintained 4.8+ rating over 3 exchanges.', icon: 'Award', badgeColor: 'amber' },
    }),
    prisma.achievement.create({
      data: { code: 'RELIABLE_PARTNER', title: '100% Completion', description: 'Completed all scheduled learning sessions.', icon: 'CheckCircle', badgeColor: 'emerald' },
    }),
  ]);

  // 2. Skill Categories
  console.log('  -> Seeding Skill Categories...');
  const categoriesData = [
    { name: 'Programming Languages', description: 'Core software engineering languages', icon: 'Code' },
    { name: 'Web Development', description: 'Frontend, backend, and full-stack web tech', icon: 'Globe' },
    { name: 'Mobile Development', description: 'iOS, Android, and cross-platform mobile apps', icon: 'Smartphone' },
    { name: 'Data Science & AI', description: 'Machine learning, statistics, data analytics', icon: 'Brain' },
    { name: 'DevOps & Cloud', description: 'CI/CD, Docker, Kubernetes, AWS', icon: 'Server' },
    { name: 'Database Architecture', description: 'Relational SQL, NoSQL, ORM tooling', icon: 'Database' },
    { name: 'UI/UX Design', description: 'Product design, wireframing, Figma', icon: 'Figma' },
  ];

  const categoriesMap: Record<string, string> = {};
  for (const cat of categoriesData) {
    const c = await prisma.skillCategory.create({ data: cat });
    categoriesMap[cat.name] = c.id;
  }

  // 3. Skills
  console.log('  -> Seeding Centralized Skills Database...');
  const skillsData = [
    { name: 'React', categoryId: categoriesMap['Web Development'], description: 'Modern UI library with Hooks & JSX' },
    { name: 'Next.js', categoryId: categoriesMap['Web Development'], description: 'React framework for SSR and App Router' },
    { name: 'TypeScript', categoryId: categoriesMap['Programming Languages'], description: 'Typed JavaScript at scale' },
    { name: 'Python', categoryId: categoriesMap['Programming Languages'], description: 'Versatile language for backend & AI/ML' },
    { name: 'Java', categoryId: categoriesMap['Programming Languages'], description: 'Enterprise OOP language for DSA & backends' },
    { name: 'C++', categoryId: categoriesMap['Programming Languages'], description: 'High-performance DSA and system coding' },
    { name: 'Node.js', categoryId: categoriesMap['Web Development'], description: 'Asynchronous JavaScript runtime' },
    { name: 'PostgreSQL', categoryId: categoriesMap['Database Architecture'], description: 'Advanced relational SQL database' },
    { name: 'Docker', categoryId: categoriesMap['DevOps & Cloud'], description: 'Containerization and environment isolation' },
    { name: 'System Design', categoryId: categoriesMap['Web Development'], description: 'Scalable architecture & microservices' },
    { name: 'Data Structures & Algorithms', categoryId: categoriesMap['Programming Languages'], description: 'Core placement DSA concepts' },
    { name: 'Machine Learning', categoryId: categoriesMap['Data Science & AI'], description: 'Supervised/unsupervised algorithms & PyTorch' },
    { name: 'Figma', categoryId: categoriesMap['UI/UX Design'], description: 'Collaborative UI design & prototyping' },
    { name: 'Flutter', categoryId: categoriesMap['Mobile Development'], description: 'Cross-platform mobile apps by Google' },
    { name: 'Redis', categoryId: categoriesMap['Database Architecture'], description: 'In-memory data store for caching & pub/sub' },
  ];

  const skillsMap: Record<string, string> = {};
  for (const sk of skillsData) {
    const s = await prisma.skill.create({ data: sk });
    skillsMap[sk.name] = s.id;
  }

  // 4. Career Roles
  console.log('  -> Seeding Career Roles...');
  const roleSDE = await prisma.careerRole.create({
    data: {
      title: 'Software Engineer',
      category: 'Engineering',
      description: 'Designs core applications, algorithms, and microservices.',
      averageSalary: '$110,000 / year',
      demandLevel: 'Very High',
      skills: {
        create: [
          { skillId: skillsMap['Data Structures & Algorithms'], importance: TargetRoleImportance.CRITICAL },
          { skillId: skillsMap['System Design'], importance: TargetRoleImportance.CRITICAL },
          { skillId: skillsMap['Java'], importance: TargetRoleImportance.IMPORTANT },
          { skillId: skillsMap['PostgreSQL'], importance: TargetRoleImportance.IMPORTANT },
        ],
      },
    },
  });

  const roleFullStack = await prisma.careerRole.create({
    data: {
      title: 'Full Stack Developer',
      category: 'Web Development',
      description: 'Builds end-to-end web applications with Next.js, Express, and Databases.',
      averageSalary: '$105,000 / year',
      demandLevel: 'High',
      skills: {
        create: [
          { skillId: skillsMap['React'], importance: TargetRoleImportance.CRITICAL },
          { skillId: skillsMap['TypeScript'], importance: TargetRoleImportance.CRITICAL },
          { skillId: skillsMap['Node.js'], importance: TargetRoleImportance.CRITICAL },
          { skillId: skillsMap['PostgreSQL'], importance: TargetRoleImportance.IMPORTANT },
          { skillId: skillsMap['Docker'], importance: TargetRoleImportance.IMPORTANT },
        ],
      },
    },
  });

  const roleBackend = await prisma.careerRole.create({
    data: {
      title: 'Backend Developer',
      category: 'Engineering',
      description: 'Focuses on API scalability, security, microservices, and database performance.',
      averageSalary: '$108,000 / year',
      demandLevel: 'High',
      skills: {
        create: [
          { skillId: skillsMap['Node.js'], importance: TargetRoleImportance.CRITICAL },
          { skillId: skillsMap['PostgreSQL'], importance: TargetRoleImportance.CRITICAL },
          { skillId: skillsMap['Redis'], importance: TargetRoleImportance.IMPORTANT },
          { skillId: skillsMap['Docker'], importance: TargetRoleImportance.IMPORTANT },
        ],
      },
    },
  });

  // 5. Users & Profiles
  console.log('  -> Seeding Users & Demo Accounts...');

  // Environment-driven Admin Account
  const adminUser = await prisma.user.create({
    data: {
      email: seedAdminEmail,
      passwordHash: hashedAdminPassword,
      role: Role.ADMIN,
      isVerified: true,
      profile: {
        create: {
          fullName: 'System Administrator',
          university: 'SkillXchange Ops',
          course: 'Computer Science Administration',
          graduationYear: 2024,
          location: 'San Francisco, CA',
          bio: 'Platform administrator and community moderator.',
          reputationScore: 5.0,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
        },
      },
    },
  });

  // Demo Student Account (Alex Morgan)
  const alexUser = await prisma.user.create({
    data: {
      email: 'student@example.com',
      passwordHash: hashedStudentPassword,
      role: Role.STUDENT,
      isVerified: true,
      profile: {
        create: {
          fullName: 'Alex Morgan',
          university: 'Stanford University',
          course: 'Software Engineering',
          graduationYear: 2025,
          location: 'Palo Alto, CA',
          bio: 'Full stack enthusiast eager to learn Docker & DevOps while teaching React.',
          reputationScore: 4.8,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        },
      },
      skills: {
        create: [
          { skillId: skillsMap['React'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.ADVANCED },
          { skillId: skillsMap['TypeScript'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.INTERMEDIATE },
          { skillId: skillsMap['Docker'], type: SkillType.LEARNING, proficiency: ProficiencyLevel.BEGINNER },
        ],
      },
    },
  });

  // Demo Student Account (Sarah Chen)
  const sarahUser = await prisma.user.create({
    data: {
      email: 'sarah.chen@stanford.edu',
      passwordHash: hashedStudentPassword,
      role: Role.STUDENT,
      isVerified: true,
      profile: {
        create: {
          fullName: 'Sarah Chen',
          university: 'Stanford University',
          course: 'Data Science',
          graduationYear: 2026,
          location: 'Stanford, CA',
          bio: 'Data Science senior passionate about Machine Learning and Python.',
          reputationScore: 4.9,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        },
      },
      skills: {
        create: [
          { skillId: skillsMap['Python'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.ADVANCED },
          { skillId: skillsMap['Machine Learning'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.INTERMEDIATE },
          { skillId: skillsMap['React'], type: SkillType.LEARNING, proficiency: ProficiencyLevel.BEGINNER },
        ],
      },
    },
  });

  // Demo Student Account (David Kumar)
  const davidUser = await prisma.user.create({
    data: {
      email: 'david.kumar@example.com',
      passwordHash: hashedStudentPassword,
      role: Role.STUDENT,
      isVerified: true,
      profile: {
        create: {
          fullName: 'David Kumar',
          university: 'MIT',
          course: 'Computer Science',
          graduationYear: 2026,
          location: 'Cambridge, MA',
          bio: 'Backend Architecture & System Design specialist.',
          reputationScore: 4.85,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        },
      },
      skills: {
        create: [
          { skillId: skillsMap['System Design'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.ADVANCED },
          { skillId: skillsMap['PostgreSQL'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.ADVANCED },
          { skillId: skillsMap['Python'], type: SkillType.LEARNING, proficiency: ProficiencyLevel.BEGINNER },
        ],
      },
    },
  });

  // 6. Placement Readiness
  console.log('  -> Seeding Placement Readiness...');
  await prisma.placementReadiness.create({
    data: {
      userId: alexUser.id,
      careerRoleId: roleFullStack.id,
      dsaScore: 75.0,
      systemDesignScore: 65.0,
      techStackScore: 90.0,
      softSkillsScore: 85.0,
      overallScore: 79.0,
    },
  });

  console.log('✅ Seeding completed successfully!');
  console.log('  👉 Seed Admin Email:', seedAdminEmail);
  console.log('  👉 Seed Student Email: student@example.com');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
