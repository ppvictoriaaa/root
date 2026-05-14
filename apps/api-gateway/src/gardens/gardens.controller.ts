import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Req,
  HttpException,
  UseGuards,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import type { Garden, RequestWithUser } from './gardens.types';

@UseGuards(JwtAuthGuard)
@Controller('gardens')
export class GardensController {
  private readonly gardenServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.gardenServiceUrl = this.config.get<string>(
      'GARDEN_SERVICE_URL',
      'http://localhost:3005',
    );
  }

  private userHeader(req: RequestWithUser) {
    return { 'x-user-id': req.user.sub };
  }

  @Get()
  async findAll(@Req() req: RequestWithUser): Promise<Garden[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Garden[]>(`${this.gardenServiceUrl}/gardens`, {
          headers: this.userHeader(req),
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

  @Post()
  async create(
    @Req() req: RequestWithUser,
    @Body() body: Record<string, unknown>,
  ): Promise<Garden> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<Garden>(`${this.gardenServiceUrl}/gardens`, body, {
          headers: this.userHeader(req),
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

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
    @Body() body: Record<string, unknown>,
  ): Promise<Garden> {
    try {
      const response = await firstValueFrom(
        this.httpService.put<Garden>(`${this.gardenServiceUrl}/gardens/${id}`, body, {
          headers: this.userHeader(req),
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

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Req() req: RequestWithUser,
  ): Promise<{ message: string }> {
    try {
      const response = await firstValueFrom(
        this.httpService.delete<{ message: string }>(
          `${this.gardenServiceUrl}/gardens/${id}`,
          { headers: this.userHeader(req) },
        ),
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
