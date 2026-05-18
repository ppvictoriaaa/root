import { Body, Controller, HttpException, Post, UseGuards } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('compatibility')
export class CompatibilityController {
  private readonly compatibilityServiceUrl: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
  ) {
    this.compatibilityServiceUrl = this.config.get<string>(
      'COMPATIBILITY_SERVICE_URL',
      'http://localhost:3004',
    );
  }

  @Post()
  async evaluate(@Body() body: unknown) {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.compatibilityServiceUrl}/compatibility`,
          body,
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
