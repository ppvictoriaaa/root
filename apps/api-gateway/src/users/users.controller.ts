import {
  Body,
  Controller,
  Delete,
  Get,
  HttpException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type {
  DeleteResult,
  GardenNotificationSettings,
  RequestWithUser,
  UserProfile,
} from './users.types';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UsersController {
  private readonly userSvcUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.userSvcUrl = this.config.get<string>(
      'USER_SERVICE_URL',
      'http://localhost:3002/users',
    );
  }

  private headers(req: RequestWithUser): Record<string, string> {
    return { 'x-user-id': String(req.user.sub) };
  }

  private handleError(err: unknown): never {
    const error = err as AxiosError;
    throw new HttpException(
      error.response?.data ?? { message: 'Internal server error' },
      error.response?.status ?? 500,
    );
  }

  @Get('profile')
  async getProfile(@Req() req: RequestWithUser): Promise<UserProfile> {
    try {
      const res = await firstValueFrom(
        this.httpService.get<UserProfile>(`${this.userSvcUrl}/profile`, {
          headers: this.headers(req),
        }),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Patch('profile')
  async updateProfile(
    @Req() req: RequestWithUser,
    @Body() body: Record<string, unknown>,
  ): Promise<UserProfile> {
    try {
      const res = await firstValueFrom(
        this.httpService.patch<UserProfile>(
          `${this.userSvcUrl}/profile`,
          body,
          {
            headers: this.headers(req),
          },
        ),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Delete('profile')
  async deleteProfile(@Req() req: RequestWithUser): Promise<DeleteResult> {
    try {
      const res = await firstValueFrom(
        this.httpService.delete<DeleteResult>(`${this.userSvcUrl}/profile`, {
          headers: this.headers(req),
        }),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Post('notifications/send-verification')
  async sendVerification(
    @Req() req: RequestWithUser,
    @Body() body: { email: string },
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.userSvcUrl}/notifications/send-verification`,
          body,
          { headers: this.headers(req) },
        ),
      );
    } catch (err) {
      this.handleError(err);
    }
  }

  @Post('notifications/verify-code')
  async verifyCode(
    @Req() req: RequestWithUser,
    @Body() body: { email: string; code: string },
  ): Promise<void> {
    try {
      await firstValueFrom(
        this.httpService.post(
          `${this.userSvcUrl}/notifications/verify-code`,
          body,
          {
            headers: this.headers(req),
          },
        ),
      );
    } catch (err) {
      this.handleError(err);
    }
  }

  @Get('notifications/garden-settings')
  async getAllGardenSettings(
    @Req() req: RequestWithUser,
  ): Promise<GardenNotificationSettings[]> {
    try {
      const res = await firstValueFrom(
        this.httpService.get<GardenNotificationSettings[]>(
          `${this.userSvcUrl}/notifications/garden-settings`,
          { headers: this.headers(req) },
        ),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Get('notifications/garden-settings/:gardenId')
  async getGardenSettings(
    @Req() req: RequestWithUser,
    @Param('gardenId') gardenId: string,
  ): Promise<GardenNotificationSettings> {
    try {
      const res = await firstValueFrom(
        this.httpService.get<GardenNotificationSettings>(
          `${this.userSvcUrl}/notifications/garden-settings/${gardenId}`,
          { headers: this.headers(req) },
        ),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Patch('notifications/garden-settings/:gardenId')
  async upsertGardenSettings(
    @Req() req: RequestWithUser,
    @Param('gardenId') gardenId: string,
    @Body()
    body: { notificationEmail: string; daysBefore: number; time: string },
  ): Promise<GardenNotificationSettings> {
    try {
      const res = await firstValueFrom(
        this.httpService.patch<GardenNotificationSettings>(
          `${this.userSvcUrl}/notifications/garden-settings/${gardenId}`,
          body,
          { headers: this.headers(req) },
        ),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Post('notifications/trigger-test/:gardenId')
  async triggerTestReminder(
    @Req() req: RequestWithUser,
    @Param('gardenId') gardenId: string,
  ): Promise<{
    sent: boolean;
    eventsCount: number;
    previewUrl: string | null;
    targetDate: string;
  }> {
    try {
      const res = await firstValueFrom(
        this.httpService.post<{
          sent: boolean;
          eventsCount: number;
          previewUrl: string | null;
          targetDate: string;
        }>(
          `${this.userSvcUrl}/notifications/trigger-test/${gardenId}`,
          {},
          { headers: this.headers(req) },
        ),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}
