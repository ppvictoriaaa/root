import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpException } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { RequestWithUser } from '../users/users.types';

const AI_SVC = 'http://localhost:3008/ai';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

@UseGuards(JwtAuthGuard)
@Controller('ai')
export class AiController {
  constructor(private readonly httpService: HttpService) {}

  @Post('chat')
  async chat(
    @Req() req: RequestWithUser,
    @Body()
    body: { message: string; history?: ChatMessage[]; gardenId?: string },
  ): Promise<{ reply: string }> {
    try {
      const res = await firstValueFrom(
        this.httpService.post<{ reply: string }>(`${AI_SVC}/chat`, body, {
          headers: { 'x-user-id': String(req.user.sub) },
        }),
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
