import Anthropic from '@anthropic-ai/sdk';
import Constants from 'expo-constants';
import { ShleepyContext } from '../../types/shleepy';

const getApiKey = () => {
  return process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY || Constants.expoConfig?.extra?.anthropicApiKey;
};

const client = new Anthropic({
  apiKey: getApiKey(),
});

const SHLEEPY_SYSTEM_PROMPT = `You are Shleepy, a witty and sassy sheep mascot for a sleep-tracking app called Sheepify.
Your job is to encourage good sleep habits through humor, puns, and sheep-related wordplay.

Personality:
- Obsessed with sheep and wool
- Every response must include sheep puns
- Supportive but sarcastic
- Gets sassier when users have bad sleep
- Enthusiastic about good sleep habits

Rules:
- CRITICAL: Your ENTIRE response must be under 100 characters MAXIMUM (including spaces and emojis)
- You MUST finish your complete thought within 100 characters - do NOT write incomplete sentences
- Craft short, punchy, COMPLETE messages that end naturally within the limit
- Plan your message to fit the limit - if it won't fit, rephrase it shorter
- Always include at least one sheep pun
- Use emojis sparingly (🐑 😴 💤 🌙 ✨)
- Be family-friendly
- Examples of good length: "Ewe nailed it! 8 hours of sleep! 🐑✨" or "Baaaad sleep ruins wool production! 😴"`;

export const claudeService = {
  async sendMessage(userMessage: string): Promise<string> {
    try {
      const response = await client.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 60,  // Reduced for 100 char limit
        system: SHLEEPY_SYSTEM_PROMPT,
        messages: [
          {
            role: 'user',
            content: userMessage + '\n\nIMPORTANT: Your response must be a complete thought that finishes within 100 characters. Do not write incomplete sentences.',
          },
        ],
      });

      if (response.content[0].type === 'text') {
        let message = response.content[0].text;
        // Enforce 100 character limit as fallback (should rarely trigger now)
        if (message.length > 100) {
          message = message.substring(0, 97) + '...';
        }
        return message;
      }

      return "Baaaah! Error! 🐑";
    } catch (error) {
      console.error('Claude API Error:', error);
      return "Connection trouble! 😴";
    }
  },

  async generateSleepMessage(context: ShleepyContext): Promise<string> {
    const { sleepDuration, sleepQuality, streak } = context;

    let prompt = '';

    if (sleepQuality === 'perfect') {
      prompt = `Generate an affirmative message for someone who slept ${sleepDuration.toFixed(1)} hours (perfect sleep!).
      They have a ${streak}-night streak.
      Include a sheep-themed pickup line.
      Be enthusiastic and punny.`;
    } else if (sleepQuality === 'good') {
      prompt = `Generate an encouraging message for someone who slept ${sleepDuration.toFixed(1)} hours (good sleep, but not perfect).
      They have a ${streak}-night streak.
      Be supportive with sheep puns.`;
    } else {
      prompt = `Generate a roast for someone who only slept ${sleepDuration.toFixed(1)} hours (poor sleep!).
      Their streak is ${streak}.
      Use sheep puns to mock their poor sleep.
      Be sassy but not mean-spirited.`;
    }

    return this.sendMessage(prompt);
  },

  async generateDream(sleepQuality: 'poor' | 'good' | 'perfect'): Promise<string> {
    const prompt = `Generate a surreal, dreamlike snippet (1-2 sentences).
    Include sheep, wool, or sleep themes.
    Make it absurd and whimsical.
    Sleep quality was ${sleepQuality}.`;

    return this.sendMessage(prompt);
  },

  async generatePickupLine(): Promise<string> {
    const prompt = 'Generate a sheep-themed pickup line. Be witty and punny!';
    return this.sendMessage(prompt);
  },

  async generateRoast(hours: number, streak: number): Promise<string> {
    const prompt = `Generate a roast for someone who only slept ${hours} hours.
    Their streak is ${streak}.
    Use sheep puns. Be sassy!`;
    return this.sendMessage(prompt);
  },
};
