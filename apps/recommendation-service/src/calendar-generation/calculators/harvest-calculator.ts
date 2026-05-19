import { addDays } from '../../common/utils/date.utils';
import { CareTaskType } from '../../common/enums/care-task-type.enum';

interface HarvestRule {
  plantSlug: string;
  harvesting: { enabled: boolean };
  growth: { isPerennial?: boolean; normalDaysToHarvest?: number };
}

export interface HarvestEvent {
  plantSlug: string;
  type: CareTaskType;
  title: string;
  description?: string;
  date: Date;
  status: 'planned';
  source: 'base';
  weatherAdjusted: boolean;
  accuracyLevel: 'estimated';
  metadata: { variety?: string };
}

/**
 * Generates at most one harvest event.
 * Returns null when harvest cannot or should not be scheduled:
 *   - harvesting.enabled = false
 *   - growthDays is null (perennial without timeline data)
 */
export function generateHarvestEvent(
  rule: HarvestRule,
  plantedAt: Date,
  growthDays: number | null,
  selectedVariety?: string,
): HarvestEvent | null {
  if (!rule.harvesting.enabled) return null;
  if (growthDays === null) return null;

  // Extra guard: perennial tree with no days-to-harvest should not produce harvest
  if (rule.growth.isPerennial && !rule.growth.normalDaysToHarvest) return null;

  const harvestDate = addDays(plantedAt, growthDays);

  return {
    plantSlug: rule.plantSlug,
    type: CareTaskType.Harvesting,
    title: `Expected harvest for ${rule.plantSlug}`,
    description: `Estimated harvest based on ${selectedVariety ?? 'standard'} variety growth period.`,
    date: harvestDate,
    status: 'planned',
    source: 'base',
    weatherAdjusted: false,
    accuracyLevel: 'estimated',
    metadata: { variety: selectedVariety },
  };
}
