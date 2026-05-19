import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Model } from 'mongoose';
import { CareCalendarEvent, CareCalendarEventDocument } from './schemas/care-calendar-event.schema';
import { CareCalendarMeta, CareCalendarMetaDocument } from './schemas/care-calendar-meta.schema';
import { WeatherService } from '../weather/weather.service';
import { WeatherForecastDay } from '../weather/interfaces/weather-forecast.interface';
import { CareTaskType } from '../common/enums/care-task-type.enum';
import { addDays, clampDate, toDateString } from '../common/utils/date.utils';

const RAIN_THRESHOLD_MM = 5;
const HEAT_THRESHOLD_C  = 30;

@Injectable()
export class WeatherRefreshService {
  private readonly logger = new Logger(WeatherRefreshService.name);

  constructor(
    @InjectModel(CareCalendarEvent.name)
    private readonly eventModel: Model<CareCalendarEventDocument>,
    @InjectModel(CareCalendarMeta.name)
    private readonly metaModel: Model<CareCalendarMetaDocument>,
    private readonly weatherService: WeatherService,
  ) {}

  // Runs automatically at 06:00 every 3 days.
  // Iterates all gardens that have saved metadata and refreshes their near-future watering events.
  @Cron('0 6 */3 * *')
  async runScheduledRefresh(): Promise<void> {
    this.logger.log('Scheduled weather refresh started');

    const allMeta = await this.metaModel.find().lean().exec();
    this.logger.log(`Refreshing weather for ${allMeta.length} garden(s)`);

    let refreshed = 0;
    for (const meta of allMeta) {
      try {
        await this.refreshGarden(meta.gardenId);
        refreshed++;
      } catch (err: any) {
        this.logger.warn(`Refresh failed for garden ${meta.gardenId}: ${err?.message}`);
      }
    }

    this.logger.log(`Scheduled refresh complete. Refreshed: ${refreshed}/${allMeta.length}`);
  }

  // Called manually via POST /care-calendar/:gardenId/refresh-weather
  async refreshByGardenId(gardenId: string): Promise<{
    gardenId: string;
    weatherAccuracyDays: number;
    adjustedEvents: number;
    notice: string;
  }> {
    const meta = await this.metaModel.findOne({ gardenId }).lean().exec();
    if (!meta) {
      throw new NotFoundException(
        `No calendar metadata found for garden: ${gardenId}. Generate a calendar first.`,
      );
    }
    return this.refreshGarden(gardenId);
  }

  // Core refresh logic shared between cron and manual endpoint.
  private async refreshGarden(gardenId: string): Promise<{
    gardenId: string;
    weatherAccuracyDays: number;
    adjustedEvents: number;
    notice: string;
  }> {
    const meta = await this.metaModel.findOne({ gardenId }).lean().exec();
    if (!meta) throw new NotFoundException(`Metadata not found for garden: ${gardenId}`);

    // Step 1: fetch fresh forecast for this garden's location
    const forecast = await this.weatherService.getForecast(
      meta.location.latitude,
      meta.location.longitude,
    );

    if (!forecast || forecast.days.length === 0) {
      return {
        gardenId,
        weatherAccuracyDays: 0,
        adjustedEvents: 0,
        notice: 'Weather API unavailable. Events were not updated.',
      };
    }

    const forecastDays = forecast.days.length;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const forecastEnd = new Date(forecast.days[forecast.days.length - 1].date);
    forecastEnd.setHours(23, 59, 59, 999);

    const forecastMap = new Map<string, WeatherForecastDay>();
    for (const day of forecast.days) forecastMap.set(day.date, day);

    // Step 2: load only planned watering events within the forecast window
    const upcomingWatering = await this.eventModel
      .find({
        gardenId,
        type: CareTaskType.Watering,
        status: 'planned',
        date: { $gte: today, $lte: forecastEnd },
      })
      .sort({ plantSlug: 1, date: 1 })
      .exec();

    if (upcomingWatering.length === 0) {
      await this.metaModel.updateOne({ gardenId }, { $set: { lastWeatherRefreshAt: new Date() } });
      return {
        gardenId,
        weatherAccuracyDays: forecastDays,
        adjustedEvents: 0,
        notice: `No upcoming watering events in the next ${forecastDays} days to adjust.`,
      };
    }

    // Step 3: apply weather rules and persist changes
    let adjustedCount = 0;

    for (const event of upcomingWatering) {
      const eventDate  = new Date(event.date);
      const dateStr    = toDateString(eventDate);
      const prevStr    = toDateString(addDays(eventDate, -1));

      const weather    = forecastMap.get(dateStr);
      if (!weather) continue;

      const prevWeather      = forecastMap.get(prevStr);
      const precipToday      = weather.precipitationSum ?? 0;
      const precipYesterday  = prevWeather?.precipitationSum ?? 0;
      const cumulativePrecip = precipToday + precipYesterday;

      let shift = 0;
      let shiftReason = '';

      if (cumulativePrecip >= RAIN_THRESHOLD_MM) {
        shift = 2;
        shiftReason = precipYesterday >= 2
          ? `Recent rain (${cumulativePrecip.toFixed(1)} mm over 2 days)`
          : `Rain expected (${precipToday.toFixed(1)} mm)`;
      } else if (weather.temperatureMax >= HEAT_THRESHOLD_C && precipToday < 1) {
        shift = -1;
        shiftReason = 'High temperature and no rain';
      }

      if (shift === 0) continue;

      const originalDate = new Date(event.date);
      const newDate = clampDate(addDays(originalDate, shift), today);

      await this.eventModel.updateOne(
        { _id: event._id },
        {
          $set: {
            date: newDate,
            source: 'weather-adjusted',
            weatherAdjusted: true,
            accuracyLevel: 'high',
            'metadata.originalDate': originalDate,
            'metadata.shiftReason': shiftReason,
            'metadata.temperature': weather.temperatureMax,
            'metadata.precipitation': precipToday,
            'metadata.precipitationPrevDay': precipYesterday,
          },
        },
      );

      adjustedCount++;
    }

    // Step 4: record the refresh timestamp
    await this.metaModel.updateOne(
      { gardenId },
      { $set: { lastWeatherRefreshAt: new Date() } },
    );

    this.logger.log(`Garden ${gardenId}: adjusted ${adjustedCount} watering event(s)`);

    return {
      gardenId,
      weatherAccuracyDays: forecastDays,
      adjustedEvents: adjustedCount,
      notice:
        adjustedCount > 0
          ? `${adjustedCount} watering event(s) updated based on the latest ${forecastDays}-day forecast.`
          : `Forecast checked. No adjustments needed for the next ${forecastDays} days.`,
    };
  }
}
