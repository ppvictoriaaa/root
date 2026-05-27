import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Controller('auth')
export class AuthController {
  private readonly authServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.authServiceUrl = this.config.get<string>(
      'AUTH_SERVICE_URL',
      'http://localhost:3001',
    );
  }

  @Post('register')
  async register(@Body() body: Record<string, unknown>) {
    try {
      const response = await firstValueFrom(
        this.httpService.post<Record<string, unknown>>(
          `${this.authServiceUrl}/auth/register`,
          body,
        ),
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status ?? 500;
      const message = error.response?.data ?? {
        message: 'Internal server error',
      };
      throw new HttpException(message as object, status);
    }
  }

  @HttpCode(200)
  @Post('login')
  async login(@Body() body: Record<string, unknown>) {
    try {
      const response = await firstValueFrom(
        this.httpService.post<Record<string, unknown>>(
          `${this.authServiceUrl}/auth/login`,
          body,
        ),
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      const status = error.response?.status ?? 500;
      const message = error.response?.data ?? {
        message: 'Internal server error',
      };
      throw new HttpException(message as object, status);
    }
  }
}
