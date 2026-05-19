import { addDays } from '../../common/utils/date.utils';
import { CareTaskType } from '../../common/enums/care-task-type.enum';
import { SoilType } from '../../common/enums/soil-type.enum';
import { VarietyType } from '../../common/enums/variety-type.enum';

interface WateringRule {
  plantSlug: string;
  watering: {
    enabled: boolean;
    baseIntervalDays?: number;
    waterNeed?: 'low' | 'medium' | 'high';
  };
  varietyType: string;
}

const SOIL_COEFFICIENTS: Record<string, number> = {
  [SoilType.Sandy]: 0.8,
  [SoilType.Loamy]: 1.0,
  [SoilType.Clay]: 1.2,
};

const WATER_NEED_COEFFICIENTS: Record<string, number> = {
  low: 1.2,
  medium: 1.0,
  high: 0.8,
};

const RIPENING_VARIETY_COEFFICIENTS: Record<string, number> = {
  early: 0.95,
  normal: 1.0,
  late: 1.05,
};

const HARVEST_SEASON_COEFFICIENTS: Record<string, number> = {
  summer: 0.95,
  autumn: 1.0,
  winter: 1.1,
};

export interface WateringEvent {
  plantSlug: string;
  type: CareTaskType;
  title: string;
  date: Date;
  status: 'planned';
  source: 'base';
  weatherAdjusted: boolean;
  accuracyLevel: 'estimated';
  metadata: { variety?: string; soilType?: string };
}

/**
 * Calculates the effective watering interval in whole days, clamped to [1, 14].
 * Formula: base × soilCoefficient × waterNeedCoefficient × varietyCoefficient
 */
export function calculateWateringInterval(
  rule: WateringRule,
  soilType?: string,
  selectedVariety?: string,
): number {
  const base = rule.watering.baseIntervalDays ?? 7;
  const soil = SOIL_COEFFICIENTS[soilType ?? SoilType.Loamy] ?? 1.0;
  const need = WATER_NEED_COEFFICIENTS[rule.watering.waterNeed ?? 'medium'] ?? 1.0;

  let variety = 1.0;
  if (selectedVariety) {
    if (rule.varietyType === VarietyType.Ripening) {
      variety = RIPENING_VARIETY_COEFFICIENTS[selectedVariety] ?? 1.0;
    } else if (rule.varietyType === VarietyType.HarvestSeason) {
      variety = HARVEST_SEASON_COEFFICIENTS[selectedVariety] ?? 1.0;
    }
  }

  const interval = Math.round(base * soil * need * variety);
  return Math.max(1, Math.min(14, interval));
}

/**
 * Generates base watering events from plantedAt to endDate using the calculated interval.
 */
export function generateWateringEvents(
  rule: WateringRule,
  plantedAt: Date,
  endDate: Date,
  soilType?: string,
  selectedVariety?: string,
): WateringEvent[] {
  if (!rule.watering.enabled) return [];

  const intervalDays = calculateWateringInterval(rule, soilType, selectedVariety);
  const events: WateringEvent[] = [];

  // First watering is on the interval day after planting
  let current = addDays(plantedAt, intervalDays);

  while (current <= endDate) {
    events.push({
      plantSlug: rule.plantSlug,
      type: CareTaskType.Watering,
      title: `Water ${rule.plantSlug}`,
      date: new Date(current),
      status: 'planned',
      source: 'base',
      weatherAdjusted: false,
      accuracyLevel: 'estimated',
      metadata: {
        variety: selectedVariety,
        soilType,
      },
    });
    current = addDays(current, intervalDays);
  }

  return events;
}
