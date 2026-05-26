import { Body, Controller, Headers, Post } from '@nestjs/common';
import { AiService } from './ai.service';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatDto {
  message: string;
  history?: ChatMessage[];
  gardenId?: string;
}

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('chat')
  chat(
    @Headers('x-user-id') userId: string,
    @Body() body: ChatDto,
  ): Promise<{ reply: string }> {
    return this.aiService
      .chat(userId, body.message, body.history ?? [], body.gardenId)
      .then((reply) => ({ reply }));
  }
}
