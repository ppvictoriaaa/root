import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';

@Controller('auth')
export class AuthController {
  constructor(private readonly httpService: HttpService) {}

  @Post('register')
  async register(@Body() body: Record<string, unknown>) {
    try {
      const response = await firstValueFrom(
        this.httpService.post<Record<string, unknown>>(
          'http://localhost:3001/auth/register',
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
          'http://localhost:3001/auth/login',
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
