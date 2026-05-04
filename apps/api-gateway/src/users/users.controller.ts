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
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { DeleteResult, RequestWithUser, UserProfile } from './users.types';

const USER_SERVICE_URL = 'http://localhost:3002/users/profile';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly httpService: HttpService) {}

  @Get('profile')
  async getProfile(@Req() req: RequestWithUser): Promise<UserProfile> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<UserProfile>(USER_SERVICE_URL, {
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

  @Patch('profile')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() body: Record<string, unknown>,
  ): Promise<UserProfile> {
    try {
      const response = await firstValueFrom(
        this.httpService.patch<UserProfile>(USER_SERVICE_URL, body, {
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
  async deleteProfile(@Req() req: RequestWithUser): Promise<DeleteResult> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete<DeleteResult>(USER_SERVICE_URL, {
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
