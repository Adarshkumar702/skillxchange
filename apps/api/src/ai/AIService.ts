import { AIServiceInterface } from './AIServiceInterface';
import { GeminiProvider } from './GeminiProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { MockAIProvider } from './MockAIProvider';
import { ENV } from '../config/env';

export class AIService {
  private static instance: AIServiceInterface;

  public static getInstance(): AIServiceInterface {
    if (!this.instance) {
      if (ENV.AI_PROVIDER === 'gemini' && ENV.GEMINI_API_KEY) {
        this.instance = new GeminiProvider(ENV.GEMINI_API_KEY);
      } else if (ENV.AI_PROVIDER === 'openai' && ENV.OPENAI_API_KEY) {
        this.instance = new OpenAIProvider(ENV.OPENAI_API_KEY);
      } else {
        this.instance = new MockAIProvider();
      }
    }
    return this.instance;
  }
}
