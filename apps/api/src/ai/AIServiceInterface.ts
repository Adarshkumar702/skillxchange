export interface SkillRecommendation {
  skillName: string;
  category: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  reason: string;
}

export interface SkillGapAnalysisResult {
  targetRole: string;
  currentMatchPercentage: number;
  acquiredSkills: string[];
  missingCriticalSkills: string[];
  missingImportantSkills: string[];
  recommendedLearningPath: string[];
  mentorProfiles: Array<{
    userId: string;
    fullName: string;
    university: string;
    teachSkill: string;
  }>;
}

export interface CareerRoadmapStep {
  dayRange: string;
  title: string;
  description: string;
  keySkillsToMaster: string[];
  recommendedProject: string;
}

export interface AIServiceInterface {
  recommendSkills(userContext: {
    fullName: string;
    teachingSkills: string[];
    learningSkills: string[];
    course: string;
  }): Promise<SkillRecommendation[]>;

  analyzeSkillGap(userContext: {
    currentSkills: string[];
    targetRoleTitle: string;
  }): Promise<SkillGapAnalysisResult>;

  generateCareerRoadmap(userContext: {
    currentSkills: string[];
    targetRoleTitle: string;
    timelineDays: number;
  }): Promise<CareerRoadmapStep[]>;

  careerChat(userContext: {
    fullName: string;
    university: string;
    course: string;
    skills: string[];
  }, prompt: string, history?: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string>;
}
