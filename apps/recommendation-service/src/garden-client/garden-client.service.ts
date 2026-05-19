import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface PlacedPlant {
  id: string;
  plantId: string;
  name: string;
  slug: string;
  category?: string;
  variety?: string;
  plantedAt?: string;
}

export interface GardenData {
  _id: string;
  userId: string;
  name: string;
  placedPlants: PlacedPlant[];
}

@Injectable()
export class GardenClientService {
  private readonly logger = new Logger(GardenClientService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getGardenById(gardenId: string): Promise<GardenData> {
    const baseUrl = this.config.get<string>(
      'GARDEN_SERVICE_URL',
      'http://localhost:3005',
    );

    try {
      const { data } = await firstValueFrom(
        this.http.get<GardenData>(`${baseUrl}/gardens/${gardenId}`),
      );
      return data;
    } catch (error: any) {
      if (error?.response?.status === 404) {
        throw new NotFoundException(`Garden not found: ${gardenId}`);
      }
      this.logger.error(`Failed to fetch garden ${gardenId}: ${error?.message}`);
      throw new NotFoundException(`Could not reach garden service. Check that it is running.`);
    }
  }
}
