import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { WeatherForecast, WeatherForecastDay } from './interfaces/weather-forecast.interface';

/**
 * Fetches short-term weather forecast from Open-Meteo (free, no API key required).
 * The provider is isolated here — swap the implementation without touching other services.
 * Docs: https://open-meteo.com/en/docs
 */
@Injectable()
export class WeatherService {
  private readonly logger = new Logger(WeatherService.name);

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {}

  async getForecast(latitude: number, longitude: number): Promise<WeatherForecast | null> {
    const forecastDays = this.config.get<number>('WEATHER_FORECAST_DAYS', 16);
    const baseUrl = this.config.get<string>(
      'WEATHER_API_URL',
      'https://api.open-meteo.com/v1/forecast',
    );

    try {
      const { data } = await firstValueFrom(
        this.http.get(baseUrl, {
          params: {
            latitude,
            longitude,
            daily: 'temperature_2m_max,temperature_2m_min,precipitation_sum',
            forecast_days: forecastDays,
            past_days: 7,
            timezone: 'auto',
          },
        }),
      );

      const days: WeatherForecastDay[] = (data.daily.time as string[]).map(
        (date: string, i: number) => ({
          date,
          temperatureMax: data.daily.temperature_2m_max[i],
          temperatureMin: data.daily.temperature_2m_min[i],
          precipitationSum: data.daily.precipitation_sum[i] ?? 0,
        }),
      );

      return { days };
    } catch (error: any) {
      this.logger.warn(`Weather API call failed: ${error?.message ?? error}`);
      return null;
    }
  }
}
