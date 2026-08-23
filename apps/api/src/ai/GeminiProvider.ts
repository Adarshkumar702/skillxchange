import { GoogleGenerativeAI } from '@google/generative-ai';
import {
  AIServiceInterface,
  SkillRecommendation,
  SkillGapAnalysisResult,
  CareerRoadmapStep,
} from './AIServiceInterface';
import { MockAIProvider } from './MockAIProvider';

export class GeminiProvider implements AIServiceInterface {
  private genAI: GoogleGenerativeAI;
  private fallback = new MockAIProvider();

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async recommendSkills(userContext: {
    fullName: string;
    teachingSkills: string[];
    learningSkills: string[];
    course: string;
  }): Promise<SkillRecommendation[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Return ONLY a valid JSON array of 4 objects representing recommended skills to learn for a student studying ${userContext.course}.
Teaching skills: ${userContext.teachingSkills.join(', ')}.
Learning skills: ${userContext.learningSkills.join(', ')}.
Each object MUST match format: {"skillName": string, "category": string, "priority": "HIGH"|"MEDIUM"|"LOW", "reason": string}. Do not add markdown backticks outside.`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, '').trim();
      return JSON.parse(text);
    } catch {
      return this.fallback.recommendSkills(userContext);
    }
  }

  async analyzeSkillGap(userContext: {
    currentSkills: string[];
    targetRoleTitle: string;
  }): Promise<SkillGapAnalysisResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Return ONLY a valid JSON object analyzing skill gap for target role "${userContext.targetRoleTitle}" given current skills [${userContext.currentSkills.join(', ')}].
Format: {"targetRole": string, "currentMatchPercentage": number, "acquiredSkills": string[], "missingCriticalSkills": string[], "missingImportantSkills": string[], "recommendedLearningPath": string[], "mentorProfiles": []}`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, '').trim();
      return JSON.parse(text);
    } catch {
      return this.fallback.analyzeSkillGap(userContext);
    }
  }

  async generateCareerRoadmap(userContext: {
    currentSkills: string[];
    targetRoleTitle: string;
    timelineDays: number;
  }): Promise<CareerRoadmapStep[]> {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Return ONLY a JSON array of 3 milestone steps for a ${userContext.timelineDays}-day roadmap to become a ${userContext.targetRoleTitle} starting from skills [${userContext.currentSkills.join(', ')}].
Format: [{"dayRange": string, "title": string, "description": string, "keySkillsToMaster": string[], "recommendedProject": string}]`;

      const result = await model.generateContent(prompt);
      const text = result.response.text().replace(/```json|```/g, '').trim();
      return JSON.parse(text);
    } catch {
      return this.fallback.generateCareerRoadmap(userContext);
    }
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
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const sysContext = `You are SkillXchange AI Career Assistant helping ${userContext.fullName} (${userContext.course} student at ${userContext.university}). Their skills: ${userContext.skills.join(', ')}. Keep answers encouraging, concise, actionable, markdown formatted.`;
      const fullPrompt = `${sysContext}\nUser question: ${prompt}`;
      const result = await model.generateContent(fullPrompt);
      return result.response.text();
    } catch {
      return this.fallback.careerChat(userContext, prompt, history);
    }
  }
}
