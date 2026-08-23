import OpenAI from 'openai';
import {
  AIServiceInterface,
  SkillRecommendation,
  SkillGapAnalysisResult,
  CareerRoadmapStep,
} from './AIServiceInterface';
import { MockAIProvider } from './MockAIProvider';

export class OpenAIProvider implements AIServiceInterface {
  private openai: OpenAI;
  private fallback = new MockAIProvider();

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
  }

  async recommendSkills(userContext: {
    fullName: string;
    teachingSkills: string[];
    learningSkills: string[];
    course: string;
  }): Promise<SkillRecommendation[]> {
    try {
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a career advisor. Return ONLY valid JSON array of 4 skill recommendation objects.',
          },
          {
            role: 'user',
            content: `Recommend 4 skills for student studying ${userContext.course}. Teaching: ${userContext.teachingSkills.join(', ')}. Learning: ${userContext.learningSkills.join(', ')}.`,
          },
        ],
      });
      const text = response.choices[0]?.message?.content || '[]';
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
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Return ONLY valid JSON analyzing skill gap for target role.',
          },
          {
            role: 'user',
            content: `Analyze gap for "${userContext.targetRoleTitle}" with current skills [${userContext.currentSkills.join(', ')}].`,
          },
        ],
      });
      const text = response.choices[0]?.message?.content || '{}';
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
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'Return ONLY valid JSON array of 3 milestone steps.',
          },
          {
            role: 'user',
            content: `Generate ${userContext.timelineDays}-day roadmap for "${userContext.targetRoleTitle}" given current skills [${userContext.currentSkills.join(', ')}].`,
          },
        ],
      });
      const text = response.choices[0]?.message?.content || '[]';
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
      const msgs: any[] = [
        {
          role: 'system',
          content: `You are SkillXchange AI Career Assistant helping ${userContext.fullName} (${userContext.course} at ${userContext.university}). Skills: ${userContext.skills.join(', ')}.`,
        },
      ];
      if (history) {
        msgs.push(...history);
      }
      msgs.push({ role: 'user', content: prompt });
      const response = await this.openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: msgs,
      });
      return response.choices[0]?.message?.content || 'No response generated.';
    } catch {
      return this.fallback.careerChat(userContext, prompt, history);
    }
  }
}
