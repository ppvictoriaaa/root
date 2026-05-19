import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PlantCareRulesService } from '../plant-care-rules/plant-care-rules.service';
import { WeatherService } from '../weather/weather.service';
import { GardenClientService } from '../garden-client/garden-client.service';
import { GenerateCareCalendarDto } from '../care-calendar/dto/generate-calendar.dto';
import { calculateGrowthDays } from './calculators/growth-calculator';
import { generateWateringEvents, WateringEvent } from './calculators/watering-calculator';
import { generateFertilizingEvents } from './calculators/fertilizing-calculator';
import { generateHarvestEvent } from './calculators/harvest-calculator';
import { WeatherForecastDay } from '../weather/interfaces/weather-forecast.interface';
import { CareTaskType } from '../common/enums/care-task-type.enum';
import { addDays, addMonths, toDateString, clampDate } from '../common/utils/date.utils';
import { PlantCategory } from '../common/enums/plant-category.enum';
import { VarietyType } from '../common/enums/variety-type.enum';

type AnyEvent = {
  userId: string;
  gardenId: string;
  plantSlug: string;
  type: CareTaskType;
  title: string;
  description?: string;
  date: Date;
  status: 'planned';
  source: 'base' | 'weather-adjusted' | 'manual';
  weatherAdjusted: boolean;
  accuracyLevel: 'high' | 'estimated';
  metadata: Record<string, unknown>;
};

export interface CalendarGenerationResult {
  calendarStart: string;
  calendarEnd: string;
  weatherApplied: boolean;
  weatherAccuracyDays: number;
  notice: string;
  events: AnyEvent[];
}

@Injectable()
export class CalendarGenerationService {
  private readonly logger = new Logger(CalendarGenerationService.name);

  constructor(
    private readonly rulesService: PlantCareRulesService,
    private readonly weatherService: WeatherService,
    private readonly gardenClient: GardenClientService,
  ) {}

  async generate(dto: GenerateCareCalendarDto): Promise<CalendarGenerationResult> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // ── 1. Fetch the garden from garden-service and validate it belongs to the user ──
    const garden = await this.gardenClient.getGardenById(dto.gardenId);

    if (garden.userId !== dto.userId) {
      throw new BadRequestException('This garden does not belong to the specified user.');
    }

    if (!garden.placedPlants || garden.placedPlants.length === 0) {
      throw new BadRequestException('The garden has no plants. Add plants to the garden first.');
    }

    // ── 3. Load care rules for every plant slug present in the garden ──────────
    const slugs = [...new Set(garden.placedPlants.map((p) => p.slug))];
    const rules = await this.rulesService.findManySlugs(slugs);
    const ruleMap = new Map(rules.map((r) => [r.plantSlug, r]));

    for (const slug of slugs) {
      if (!ruleMap.has(slug)) {
        throw new BadRequestException(`No care rule found for plant: ${slug}`);
      }
    }

    // ── 4. Validate varieties against each plant's allowed list ─────────────────
    for (const plant of garden.placedPlants) {
      if (!plant.variety) continue;

      const rule = ruleMap.get(plant.slug)!;
      if (rule.supportsVarieties && rule.allowedVarieties.length > 0) {
        if (!rule.allowedVarieties.includes(plant.variety)) {
          throw new BadRequestException(
            `Variety "${plant.variety}" is not allowed for ${plant.slug}. ` +
              `Allowed: ${rule.allowedVarieties.join(', ')}`,
          );
        }
      }
    }

    // ── 5. Calculate calendar end date from the longest growth period ────────────
    let maxGrowthDays = 0;
    for (const plant of garden.placedPlants) {
      const rule = ruleMap.get(plant.slug)!;
      const growthDays = calculateGrowthDays(rule, plant.variety);
      if (growthDays && growthDays > maxGrowthDays) maxGrowthDays = growthDays;
    }

    const calendarStart = today;
    let calendarEnd: Date;

    if (dto.months) {
      calendarEnd = addMonths(calendarStart, dto.months);
    } else if (maxGrowthDays > 0) {
      const growthMonths = Math.ceil(maxGrowthDays / 30);
      calendarEnd = addMonths(calendarStart, Math.max(3, Math.min(6, growthMonths)));
    } else {
      calendarEnd = addMonths(calendarStart, 3);
    }

    // ── 6. Generate events for each plant in the garden ──────────────────────────
    const allEvents: AnyEvent[] = [];

    // Deduplicate by slug — a garden can have the same plant placed multiple times,
    // but we generate one care schedule per unique plant type.
    const processedSlugs = new Set<string>();

    for (const plant of garden.placedPlants) {
      if (processedSlugs.has(plant.slug)) continue;
      processedSlugs.add(plant.slug);

      const rule = ruleMap.get(plant.slug)!;

      // variety and plantedAt come directly from the saved garden data
      const selectedVariety =
        rule.supportsVarieties && rule.varietyType !== VarietyType.None
          ? plant.variety
          : undefined;

      const plantedAt = plant.plantedAt ? new Date(plant.plantedAt) : new Date(today);
      plantedAt.setHours(0, 0, 0, 0);

      const growthDays = calculateGrowthDays(rule, selectedVariety);

      const wateringEvents = generateWateringEvents(
        rule,
        plantedAt,
        calendarEnd,
        dto.soilType,
        selectedVariety,
      );
      allEvents.push(...(wateringEvents as unknown as AnyEvent[]));

      const fertilizingEvents = generateFertilizingEvents(
        rule,
        plantedAt,
        calendarEnd,
        selectedVariety,
      );
      allEvents.push(...(fertilizingEvents as unknown as AnyEvent[]));

      const harvestEvent = generateHarvestEvent(rule, plantedAt, growthDays, selectedVariety);
      if (harvestEvent) allEvents.push(harvestEvent as unknown as AnyEvent);

      const hasCareEvent =
        !rule.harvesting.enabled &&
        [PlantCategory.Flower, PlantCategory.Herb, PlantCategory.Tree].includes(
          rule.category as PlantCategory,
        );

      if (hasCareEvent) {
        const careDate = addMonths(plantedAt, 1);
        if (careDate <= calendarEnd) {
          allEvents.push({
            userId: dto.userId,
            gardenId: dto.gardenId,
            plantSlug: plant.slug,
            type: CareTaskType.Care,
            title: this.getCareEventTitle(rule.category as PlantCategory, plant.slug),
            date: careDate,
            status: 'planned',
            source: 'base',
            weatherAdjusted: false,
            accuracyLevel: 'estimated',
            metadata: { variety: selectedVariety },
          });
        }
      }
    }

    // ── 7. Stamp userId + gardenId on every generated event ─────────────────────
    for (const event of allEvents) {
      event.userId = dto.userId;
      event.gardenId = dto.gardenId;
    }

    // ── 8. Fetch weather and apply adjustments to the nearest forecast window ────
    let weatherApplied = false;
    let weatherAccuracyDays = 0;
    let notice =
      'Calendar generated based on base plant care rules. ' +
      'Weather data was not available — all events are estimated.';

    if (dto.location?.latitude && dto.location?.longitude) {
      const forecast = await this.weatherService.getForecast(
        dto.location.latitude,
        dto.location.longitude,
      );

      if (forecast && forecast.days.length > 0) {
        weatherAccuracyDays = forecast.days.length;
        this.applyWeatherAdjustments(allEvents, forecast.days, today);
        weatherApplied = true;
        notice =
          `Weather-based accuracy is applied only for the nearest ${weatherAccuracyDays} days. ` +
          `Later events are estimated and may be updated when new weather data becomes available.`;
      } else {
        notice =
          'Weather API was not available. Calendar generated using base plant care rules only. ' +
          'All events are estimated.';
      }
    }

    // ── 9. Sort events chronologically ───────────────────────────────────────────
    allEvents.sort((a, b) => a.date.getTime() - b.date.getTime());

    return {
      calendarStart: toDateString(calendarStart),
      calendarEnd: toDateString(calendarEnd),
      weatherApplied,
      weatherAccuracyDays,
      notice,
      events: allEvents,
    };
  }

  /**
   * Adjusts watering events inside the forecast window only.
   *
   * Rules:
   *   precipitation >= 5 mm  → +2 days (skip watering, rain is coming)
   *   tempMax >= 30°C and precipitation < 1 mm → -1 day (water sooner, it's hot)
   *
   * After the first adjusted event for each plant the shift is propagated
   * to all following watering events to keep the interval consistent.
   */
  private applyWeatherAdjustments(
    events: AnyEvent[],
    forecast: WeatherForecastDay[],
    today: Date,
  ): void {
    const forecastEnd = new Date(forecast[forecast.length - 1].date);
    forecastEnd.setHours(23, 59, 59, 999);

    const forecastMap = new Map<string, WeatherForecastDay>();
    for (const day of forecast) forecastMap.set(day.date, day);

    const wateringByPlant = new Map<string, AnyEvent[]>();
    for (const event of events) {
      if (event.type !== CareTaskType.Watering) continue;
      const list = wateringByPlant.get(event.plantSlug) ?? [];
      list.push(event);
      wateringByPlant.set(event.plantSlug, list);
    }

    for (const [, wateringEvents] of wateringByPlant) {
      let cumulativeShift = 0;
      let firstAdjusted = false;

      for (const event of wateringEvents) {
        const dateStr = toDateString(event.date);

        if (event.date <= forecastEnd) {
          const weather = forecastMap.get(dateStr);
          let shift = 0;
          let shiftReason = '';

          if (weather) {
            if (weather.precipitationSum >= 5) {
              shift = 2;
              shiftReason = 'Rain expected';
            } else if (weather.temperatureMax >= 30 && weather.precipitationSum < 1) {
              shift = -1;
              shiftReason = 'High temperature and no rain';
            }
          }

          if (shift !== 0) {
            const originalDate = new Date(event.date);
            event.date = clampDate(addDays(event.date, shift), today);
            event.source = 'weather-adjusted';
            event.weatherAdjusted = true;
            event.accuracyLevel = 'high';
            event.metadata = {
              ...event.metadata,
              originalDate,
              shiftReason,
              temperature: weather?.temperatureMax,
              precipitation: weather?.precipitationSum,
            };

            if (!firstAdjusted) {
              cumulativeShift = shift;
              firstAdjusted = true;
            }
          }
        } else if (firstAdjusted && cumulativeShift !== 0) {
          event.date = addDays(event.date, cumulativeShift);
        }
      }
    }
  }

  private getCareEventTitle(category: PlantCategory, plantSlug: string): string {
    switch (category) {
      case PlantCategory.Flower: return `Check ${plantSlug} plant condition`;
      case PlantCategory.Herb:   return `Trim or check ${plantSlug} growth`;
      case PlantCategory.Tree:   return `Check ${plantSlug} tree condition`;
      default:                   return `Care for ${plantSlug}`;
    }
  }
}
