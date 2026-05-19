import { VarietyType } from '../../common/enums/variety-type.enum';

interface GrowthRule {
  growth: {
    normalDaysToHarvest?: number;
    isPerennial?: boolean;
  };
  varietyType: string;
}

/**
 * Variety coefficients that map (varietyType, variety) → multiplier.
 * These follow the spec:
 *   ripening:       early=0.85  normal=1.00  late=1.15
 *   harvestSeason:  summer=0.90 autumn=1.00  winter=1.20
 */
const RIPENING_COEFFICIENTS: Record<string, number> = {
  early: 0.85,
  normal: 1.0,
  late: 1.15,
};

const HARVEST_SEASON_COEFFICIENTS: Record<string, number> = {
  summer: 0.9,
  autumn: 1.0,
  winter: 1.2,
};

/**
 * Returns how many days from planting until harvest for a given rule + variety.
 * Returns null when there is no harvest timeline (perennials without data, no-harvest plants).
 */
export function calculateGrowthDays(
  rule: GrowthRule,
  selectedVariety?: string,
): number | null {
  const base = rule.growth.normalDaysToHarvest;

  if (!base) return null;

  // varietyType = 'none' → no coefficient, use base directly
  if (rule.varietyType === VarietyType.None || !selectedVariety) {
    return base;
  }

  let coefficient = 1.0;

  if (rule.varietyType === VarietyType.Ripening) {
    coefficient = RIPENING_COEFFICIENTS[selectedVariety] ?? 1.0;
  } else if (rule.varietyType === VarietyType.HarvestSeason) {
    coefficient = HARVEST_SEASON_COEFFICIENTS[selectedVariety] ?? 1.0;
  }

  return Math.round(base * coefficient);
}
