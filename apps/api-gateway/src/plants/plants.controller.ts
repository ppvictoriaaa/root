import { Controller, Get, HttpException, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Plant } from './plants.types';

@UseGuards(JwtAuthGuard)
@Controller('plants')
export class PlantsController {
  constructor(private readonly httpService: HttpService) {}

  @Get()
  async findAll(): Promise<Plant[]> {
    try {
      const response = await firstValueFrom(
        this.httpService.get<Plant[]>('http://localhost:3003/plants'),
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
