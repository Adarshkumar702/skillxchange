import { PrismaClient, Role, SkillType, ProficiencyLevel, SwapStatus, TargetRoleImportance } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting SkillXchange Database Seeding...');

  // Clean existing database
  await prisma.$executeRawUnsafe('TRUNCATE TABLE "User", "Profile", "SkillCategory", "Skill", "UserSkill", "SwapRequest", "Conversation", "ConversationMember", "Message", "LearningSession", "LearningProgress", "Rating", "Achievement", "UserAchievement", "Notification", "Report", "CareerRole", "CareerRoleSkill", "AiRecommendation", "PlacementReadiness", "RefreshToken" CASCADE;');

  const hashedStudentPassword = await bcrypt.hash('password123', 10);
  const hashedAdminPassword = await bcrypt.hash('admin123', 10);

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

  // Admin Account
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@example.com',
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
          course: 'Computer Science',
          graduationYear: 2026,
          location: 'Palo Alto, CA',
          bio: 'Passionate full-stack developer looking to master Python and Docker while teaching React & TypeScript.',
          githubUrl: 'https://github.com/alexmorgan',
          linkedinUrl: 'https://linkedin.com/in/alexmorgan',
          reputationScore: 4.9,
          completedExchanges: 4,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
        },
      },
      skills: {
        create: [
          { skillId: skillsMap['React'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.EXPERT, yearsExperience: 3 },
          { skillId: skillsMap['TypeScript'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.ADVANCED, yearsExperience: 2 },
          { skillId: skillsMap['Python'], type: SkillType.LEARNING, proficiency: ProficiencyLevel.BEGINNER, yearsExperience: 0.5 },
          { skillId: skillsMap['Docker'], type: SkillType.LEARNING, proficiency: ProficiencyLevel.INTERMEDIATE, yearsExperience: 1 },
        ],
      },
    },
  });

  // Candidate Student 1 (Sarah Chen)
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
          course: 'Artificial Intelligence',
          graduationYear: 2026,
          location: 'Palo Alto, CA',
          bio: 'AI researcher and Python wizard. Eager to master modern frontend frameworks like React & Next.js.',
          githubUrl: 'https://github.com/sarahchen',
          reputationScore: 5.0,
          completedExchanges: 6,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
        },
      },
      skills: {
        create: [
          { skillId: skillsMap['Python'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.EXPERT, yearsExperience: 4 },
          { skillId: skillsMap['Machine Learning'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.ADVANCED, yearsExperience: 2 },
          { skillId: skillsMap['React'], type: SkillType.LEARNING, proficiency: ProficiencyLevel.INTERMEDIATE, yearsExperience: 1 },
        ],
      },
    },
  });

  // Candidate Student 2 (David Kumar)
  const davidUser = await prisma.user.create({
    data: {
      email: 'david.kumar@berkeley.edu',
      passwordHash: hashedStudentPassword,
      role: Role.STUDENT,
      isVerified: true,
      profile: {
        create: {
          fullName: 'David Kumar',
          university: 'UC Berkeley',
          course: 'Electrical Engineering & CS',
          graduationYear: 2025,
          location: 'Berkeley, CA',
          bio: 'DevOps enthusiast. Love containerizing applications and tuning PostgreSQL databases.',
          reputationScore: 4.8,
          completedExchanges: 3,
          avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
        },
      },
      skills: {
        create: [
          { skillId: skillsMap['Docker'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.EXPERT, yearsExperience: 3 },
          { skillId: skillsMap['PostgreSQL'], type: SkillType.TEACHING, proficiency: ProficiencyLevel.ADVANCED, yearsExperience: 2 },
          { skillId: skillsMap['System Design'], type: SkillType.LEARNING, proficiency: ProficiencyLevel.INTERMEDIATE, yearsExperience: 1 },
        ],
      },
    },
  });

  // 6. Initial Swap Request & Conversation between Alex & Sarah
  console.log('  -> Seeding Swaps, Conversations & Sessions...');
  const alexSarahSwap = await prisma.swapRequest.create({
    data: {
      senderId: alexUser.id,
      receiverId: sarahUser.id,
      offeredSkillId: skillsMap['React'],
      requestedSkillId: skillsMap['Python'],
      message: 'Hey Sarah! I noticed you teach Python and want to learn React. Let’s do a skill exchange!',
      status: SwapStatus.ACCEPTED,
      conversation: {
        create: {
          members: {
            create: [{ userId: alexUser.id }, { userId: sarahUser.id }],
          },
          messages: {
            create: [
              { senderId: alexUser.id, content: 'Hi Sarah! Excited to get started on Python.' },
              { senderId: sarahUser.id, content: 'Hey Alex! Awesome, I’m looking forward to diving deep into React hooks.' },
            ],
          },
        },
      },
      learningProgress: {
        create: {
          percentage: 40.0,
          sessionsCompleted: 2,
          totalSessions: 5,
          notes: 'Covered Python basic syntax and functions. Next session: React state management.',
        },
      },
      learningSessions: {
        create: [
          {
            createdById: alexUser.id,
            title: 'Python Basics & Data Structures',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            durationMinutes: 60,
            meetingUrl: 'https://meet.jit.si/skillxchange-python-1',
            status: 'SCHEDULED',
          },
        ],
      },
    },
  });

  // 7. Seed Placement Readiness for Alex
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
  console.log('  👉 Demo Student Account: student@example.com / password123');
  console.log('  👉 Demo Admin Account:   admin@example.com / admin123');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
