import { Controller, Get, HttpStatus, Param, Res } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import type { Response } from 'express';

@Controller('plant-icons')
export class PlantIconsController {
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

  @Get(':filename')
  async getIcon(
    @Param('filename') filename: string,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.plantServiceUrl}/plant-icons/${filename}`, {
          responseType: 'stream',
        }),
      );
      const contentType = (response.headers['content-type'] as string) ?? 'image/svg+xml';
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      (response.data as NodeJS.ReadableStream).pipe(res);
    } catch {
      res.status(HttpStatus.NOT_FOUND).end();
    }
  }
}
