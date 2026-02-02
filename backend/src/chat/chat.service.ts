import { Injectable } from '@nestjs/common';
import { LlmService } from '../llm/llm.service';
import { ChatRequestDto, ChatResponseDto } from './dto/chat.dto';

@Injectable()
export class ChatService {
  constructor(private readonly llmService: LlmService) {}

  async processMessage(chatRequest: ChatRequestDto): Promise<ChatResponseDto> {
    const reply = await this.llmService.generateResponse(chatRequest.message);
    return { reply };
  }
}
