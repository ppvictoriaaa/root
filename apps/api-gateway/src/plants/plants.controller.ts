import { Controller, Get, HttpException, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Plant } from './plants.types';

@UseGuards(JwtAuthGuard)
@Controller('plants')
export class PlantsController {
  private readonly plantServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.plantServiceUrl = this.config.get<string>(
      'PLANT_SERVICE_URL',
      'http://localhost:3003',
    );
  }

  @Get()
  async findAll(): Promise<Plant[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Plant[]>(`${this.plantServiceUrl}/plants`),
      );
      return response.data.map((plant) => ({
        ...plant,
        imageUrl: plant.imageUrl?.startsWith('/')
          ? `${this.plantServiceUrl}${plant.imageUrl}`
          : plant.imageUrl,
      }));
    } catch (err) {
      const error = err as AxiosError;
      throw new HttpException(
        error.response?.data ?? { message: 'Internal server error' },
        error.response?.status ?? 500,
      );
    }
  }
}
