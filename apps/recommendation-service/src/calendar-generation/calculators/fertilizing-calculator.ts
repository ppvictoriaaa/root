import { addDays } from '../../common/utils/date.utils';
import { CareTaskType } from '../../common/enums/care-task-type.enum';

interface FertilizingRule {
  plantSlug: string;
  fertilizing: {
    enabled: boolean;
    baseIntervalDays?: number;
    firstFertilizingAfterDays?: number;
  };
}

export interface FertilizingEvent {
  plantSlug: string;
  type: CareTaskType;
  title: string;
  date: Date;
  status: 'planned';
  source: 'base';
  weatherAdjusted: boolean;
  accuracyLevel: 'estimated';
  metadata: { variety?: string };
}

/**
 * Generates fertilizing events from plantedAt to endDate.
 * First event = plantedAt + firstFertilizingAfterDays (falls back to baseIntervalDays).
 * Subsequent events repeat every baseIntervalDays.
 */
export function generateFertilizingEvents(
  rule: FertilizingRule,
  plantedAt: Date,
  endDate: Date,
  selectedVariety?: string,
): FertilizingEvent[] {
  if (!rule.fertilizing.enabled) return [];

  const interval = rule.fertilizing.baseIntervalDays ?? 30;
  const firstOffset = rule.fertilizing.firstFertilizingAfterDays ?? interval;

  const events: FertilizingEvent[] = [];
  let current = addDays(plantedAt, firstOffset);

  while (current <= endDate) {
    events.push({
      plantSlug: rule.plantSlug,
      type: CareTaskType.Fertilizing,
      title: `Fertilize ${rule.plantSlug}`,
      date: new Date(current),
      status: 'planned',
      source: 'base',
      weatherAdjusted: false,
      accuracyLevel: 'estimated',
      metadata: { variety: selectedVariety },
    });
    current = addDays(current, interval);
  }

  return events;
}
