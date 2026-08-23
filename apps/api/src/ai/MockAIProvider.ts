import {
  AIServiceInterface,
  SkillRecommendation,
  SkillGapAnalysisResult,
  CareerRoadmapStep,
} from './AIServiceInterface';

export class MockAIProvider implements AIServiceInterface {
  async recommendSkills(userContext: {
    fullName: string;
    teachingSkills: string[];
    learningSkills: string[];
    course: string;
  }): Promise<SkillRecommendation[]> {
    const defaultRecs: SkillRecommendation[] = [
      {
        skillName: 'Docker & Containers',
        category: 'DevOps',
        priority: 'HIGH',
        reason: 'Highly sought after for Full-Stack and Backend placement preparation.',
      },
      {
        skillName: 'PostgreSQL & Database Design',
        category: 'Database',
        priority: 'HIGH',
        reason: 'Essential for production application development and system design interviews.',
      },
      {
        skillName: 'System Design Basics',
        category: 'Architecture',
        priority: 'MEDIUM',
        reason: 'Boosts placement readiness score for SDE and backend roles.',
      },
      {
        skillName: 'TypeScript',
        category: 'Web Development',
        priority: 'HIGH',
        reason: 'Industry standard for modern web application frontend & backend development.',
      },
    ];
    return defaultRecs.filter(
      (r) => !userContext.teachingSkills.includes(r.skillName) && !userContext.learningSkills.includes(r.skillName)
    );
  }

  async analyzeSkillGap(userContext: {
    currentSkills: string[];
    targetRoleTitle: string;
  }): Promise<SkillGapAnalysisResult> {
    const current = userContext.currentSkills.map((s) => s.toLowerCase());
    
    let required = ['Data Structures', 'Algorithms', 'SQL', 'Git', 'System Design', 'Node.js', 'React', 'Docker'];
    if (userContext.targetRoleTitle.toLowerCase().includes('data')) {
      required = ['Python', 'SQL', 'Pandas', 'NumPy', 'Data Visualization', 'Machine Learning', 'Statistics'];
    } else if (userContext.targetRoleTitle.toLowerCase().includes('frontend')) {
      required = ['JavaScript', 'TypeScript', 'React', 'CSS/Tailwind', 'HTML5', 'Next.js', 'REST APIs'];
    }

    const acquired = userContext.currentSkills.filter((s) =>
      required.some((r) => r.toLowerCase().includes(s.toLowerCase()))
    );
    const missing = required.filter(
      (r) => !current.some((c) => r.toLowerCase().includes(c) || c.includes(r.toLowerCase()))
    );

    const matchPct = Math.round((acquired.length / Math.max(required.length, 1)) * 100);

    return {
      targetRole: userContext.targetRoleTitle,
      currentMatchPercentage: Math.max(matchPct, 40),
      acquiredSkills: acquired.length > 0 ? acquired : userContext.currentSkills.slice(0, 3),
      missingCriticalSkills: missing.slice(0, 3),
      missingImportantSkills: missing.slice(3, 6),
      recommendedLearningPath: missing,
      mentorProfiles: [
        {
          userId: 'mock-mentor-1',
          fullName: 'Sarah Chen',
          university: 'Stanford University',
          teachSkill: missing[0] || 'System Design',
        },
        {
          userId: 'mock-mentor-2',
          fullName: 'Alex Rivera',
          university: 'MIT',
          teachSkill: missing[1] || 'Docker',
        },
      ],
    };
  }

  async generateCareerRoadmap(userContext: {
    currentSkills: string[];
    targetRoleTitle: string;
    timelineDays: number;
  }): Promise<CareerRoadmapStep[]> {
    return [
      {
        dayRange: 'Days 1 - 7',
        title: 'Core Foundations & Language Mastery',
        description: 'Focus on mastering data structures, language nuances, and version control.',
        keySkillsToMaster: ['Data Structures & Algorithms', 'Git & GitHub'],
        recommendedProject: 'Build a CLI tool or clean algorithm solver repository.',
      },
      {
        dayRange: 'Days 8 - 18',
        title: 'Backend Systems & Database Design',
        description: 'Design REST APIs, relational schemas with PostgreSQL/Prisma, and implement JWT auth.',
        keySkillsToMaster: ['Node.js/Express', 'PostgreSQL & Prisma', 'JWT Authentication'],
        recommendedProject: 'Create a fully functional REST API with authentication and database indexes.',
      },
      {
        dayRange: 'Days 19 - 30',
        title: 'System Design & Placement Polish',
        description: 'Study caching strategies (Redis), WebSockets for real-time app state, and Docker packaging.',
        keySkillsToMaster: ['Redis Caching', 'Socket.IO Real-time', 'Docker'],
        recommendedProject: 'Containerize and deploy your full-stack SaaS application to cloud staging.',
      },
    ];
  }

  async careerChat(
    userContext: {
      fullName: string;
      university: string;
      course: string;
      skills: string[];
    },
    prompt: string,
    history?: Array<{ role: 'user' | 'assistant'; content: string }>
  ): Promise<string> {
    const text = prompt.toLowerCase();
    if (text.includes('roadmap') || text.includes('plan')) {
      return `Hello ${userContext.fullName}! Based on your background in ${userContext.course} at ${userContext.university}, here is a high-priority 3-step action plan:\n\n1. **Deepen Core Stack**: Strengthen your current skills (${userContext.skills.slice(0, 3).join(', ') || 'React & Node.js'}).\n2. **Master System Design & Databases**: Learn PostgreSQL indexing, Redis caching, and REST API security.\n3. **Practice Skill Exchanges**: Connect with peers on SkillXchange to teach what you know while learning missing competencies!`;
    }
    if (text.includes('react') || text.includes('frontend')) {
      return `To master React and modern Frontend development for top tech placements:\n- Master TypeScript, React Hooks, and State Management.\n- Build responsive UI layouts with Tailwind CSS.\n- Learn SSR and Routing with Next.js (App Router).\n\nCheck the Discover tab on SkillXchange to find peers who can mentor you live!`;
    }
    return `Hi ${userContext.fullName}! As your SkillXchange AI Career Assistant, I analyzed your profile (${userContext.skills.length} skills listed). To accelerate your placement readiness for Software Engineering roles, focus on building production-grade projects, contributing to peer skill swaps, and tracking your progress on the Skill Gap Analyzer dashboard!`;
  }
}
