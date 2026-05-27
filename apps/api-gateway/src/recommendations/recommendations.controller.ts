import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller()
export class RecommendationsController {
  private readonly recSvcUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.recSvcUrl = this.config.get<string>(
      'RECOMMENDATION_SERVICE_URL',
      'http://localhost:3006',
    );
  }

  private handleError(err: unknown): never {
    const error = err as AxiosError;
    throw new HttpException(
      error.response?.data ?? { message: 'Internal server error' },
      error.response?.status ?? 500,
    );
  }

  @Post('care-calendar/generate')
  async generateCalendar(@Body() body: Record<string, unknown>) {
    try {
      const res = await firstValueFrom(
        this.httpService.post(`${this.recSvcUrl}/care-calendar/generate`, body),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Get('care-calendar/with-calendar')
  async getWithCalendar(@Query('gardenIds') gardenIds: string) {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`${this.recSvcUrl}/care-calendar/with-calendar`, {
          params: { gardenIds },
        }),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Get('care-calendar/upcoming')
  async getUpcoming(
    @Query('userId') userId: string,
    @Query('date') date: string,
    @Query('gardenId') gardenId?: string,
  ) {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`${this.recSvcUrl}/care-calendar/upcoming`, {
          params: { userId, date, gardenId },
        }),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Get('care-calendar/:gardenId/month')
  async getByMonth(
    @Param('gardenId') gardenId: string,
    @Query('year') year: string,
    @Query('month') month: string,
  ) {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`${this.recSvcUrl}/care-calendar/${gardenId}/month`, {
          params: { year, month },
        }),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Patch('care-calendar/events/:eventId/status')
  async updateStatus(
    @Param('eventId') eventId: string,
    @Body() body: { status: string },
  ) {
    try {
      const res = await firstValueFrom(
        this.httpService.patch(
          `${this.recSvcUrl}/care-calendar/events/${eventId}/status`,
          body,
        ),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Post('care-calendar/:gardenId/add-plants')
  async addPlants(
    @Param('gardenId') gardenId: string,
    @Body() body: Record<string, unknown>,
  ) {
    try {
      const res = await firstValueFrom(
        this.httpService.post(
          `${this.recSvcUrl}/care-calendar/${gardenId}/add-plants`,
          body,
        ),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Post('care-calendar/:gardenId/refresh-weather')
  async refreshWeather(@Param('gardenId') gardenId: string) {
    try {
      const res = await firstValueFrom(
        this.httpService.post(
          `${this.recSvcUrl}/care-calendar/${gardenId}/refresh-weather`,
        ),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Get('care-calendar/:gardenId')
  async getCalendar(@Param('gardenId') gardenId: string) {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`${this.recSvcUrl}/care-calendar/${gardenId}`),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }

  @Delete('care-calendar/:gardenId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteCalendar(@Param('gardenId') gardenId: string) {
    try {
      await firstValueFrom(
        this.httpService.delete(`${this.recSvcUrl}/care-calendar/${gardenId}`),
      );
    } catch (err) {
      this.handleError(err);
    }
  }

  @Get('plant-care-rules')
  async getPlantCareRules() {
    try {
      const res = await firstValueFrom(
        this.httpService.get(`${this.recSvcUrl}/plant-care-rules`),
      );
      return res.data;
    } catch (err) {
      this.handleError(err);
    }
  }
}
