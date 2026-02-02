import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

const SYSTEM_PROMPT = `You are a knowledgeable and friendly expert on Brazilian cuisine. Your expertise includes:

- Traditional dishes: feijoada, pão de queijo, churrasco, moqueca, vatapá, acarajé
- Regional cuisines: Bahian (African-influenced), Mineiro (comfort food), Gaucho (grilled meats), Northern (Amazonian ingredients)
- Street food: coxinha, pastel, açaí, tapioca
- Beverages: caipirinha, guaraná, cachaça, café brasileiro
- Ingredients: mandioca, dendê oil, hearts of palm, black beans, farofa
- Cooking techniques and cultural context

Guidelines:
1. Provide detailed, accurate information about Brazilian food
2. Include cultural context when relevant
3. Offer recipe suggestions with ingredients and steps when asked
4. Be enthusiastic and share interesting facts
5. If asked about non-Brazilian cuisine topics, politely explain that you specialize in Brazilian cuisine and redirect the conversation

Respond in the same language as the user's question (Portuguese or English).`;

@Injectable()
export class LlmService {
  private readonly logger = new Logger(LlmService.name);
  private readonly openai: OpenAI;
  private readonly model: string;

  constructor(private readonly configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('OPENAI_API_KEY'),
    });
    this.model =
      this.configService.get<string>('OPENAI_MODEL') || 'gpt-3.5-turbo';
  }

  async generateResponse(userMessage: string): Promise<string> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: this.model,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      return (
        completion.choices[0]?.message?.content ||
        'I apologize, but I could not generate a response.'
      );
    } catch (error) {
      this.logger.error('OpenAI API error:', error);
      throw new ServiceUnavailableException(
        'AI service temporarily unavailable. Please try again.',
      );
    }
  }
}
