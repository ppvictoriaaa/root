import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
  Req,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { Request } from 'express';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: { userId: string; email: string };
}

@UseGuards(JwtAuthGuard)  // всі маршрути тут вимагають токен
@Controller('users')
export class UsersController {
  constructor(private readonly httpService: HttpService) {}

  @Get('profile')
  async getProfile(@Req() req: RequestWithUser) {
    try {
      const response = await firstValueFrom(
        this.httpService.get('http://localhost:3002/users/profile', {
          headers: { 'x-user-id': req.user.userId },
          // передаємо userId через заголовок — User Service не перевіряє токен сам
        }),
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      throw new HttpException(
        error.response?.data ?? { message: 'Internal server error' },
        error.response?.status ?? 500,
      );
    }
  }

  @Patch('profile')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() body: Record<string, unknown>,
  ) {
    try {
      const response = await firstValueFrom(
        this.httpService.patch('http://localhost:3002/users/profile', body, {
          headers: { 'x-user-id': req.user.userId },
        }),
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      throw new HttpException(
        error.response?.data ?? { message: 'Internal server error' },
        error.response?.status ?? 500,
      );
    }
  }

  @Delete('profile')
  async deleteProfile(@Req() req: RequestWithUser) {
    try {
      const response = await firstValueFrom(
        this.httpService.delete('http://localhost:3002/users/profile', {
          headers: { 'x-user-id': req.user.userId },
        }),
      );
      return response.data;
    } catch (err) {
      const error = err as AxiosError;
      throw new HttpException(
        error.response?.data ?? { message: 'Internal server error' },
        error.response?.status ?? 500,
      );
    }
  }
}
