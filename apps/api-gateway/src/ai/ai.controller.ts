import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { RequestWithUser } from '../users/users.types';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  private readonly aiServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.aiServiceUrl = this.config.get<string>(
      'AI_SERVICE_URL',
      'http://localhost:3008/ai',
    );
  }

  @Post('chat')
  async chat(
    @Req() req: RequestWithUser,
    @Body()
    body: { message: string; history?: ChatMessage[]; gardenId?: string },
  ): Promise<{ reply: string }> {
    try {
      const res = await firstValueFrom(
        this.httpService.post<{ reply: string }>(
          `${this.aiServiceUrl}/chat`,
          body,
          { headers: { 'x-user-id': String(req.user.sub) } },
        ),
      );
      return res.data;
    } catch (err) {
      const error = err as AxiosError;
      throw new HttpException(
        error.response?.data ?? { message: 'AI service error' },
        error.response?.status ?? 500,
      );
    }
  }
}
