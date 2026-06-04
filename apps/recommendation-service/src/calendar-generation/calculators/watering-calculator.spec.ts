import { calculateWateringInterval, generateWateringEvents } from './watering-calculator';

const baseRule = {
  plantSlug: 'tomato',
  watering: { enabled: true, baseIntervalDays: 7, waterNeed: 'medium' as const },
  varietyType: 'none',
};

describe('calculateWateringInterval', () => {
  it('returns base interval for loamy soil and medium water need', () => {
    expect(calculateWateringInterval(baseRule, 'loamy')).toBe(7);
  });

  it('shortens interval for sandy soil (drains faster)', () => {
    // 7 × 0.8 = 5.6 → rounds to 6
    expect(calculateWateringInterval(baseRule, 'sandy')).toBe(6);
  });

  it('lengthens interval for clay soil (retains moisture)', () => {
    // 7 × 1.2 = 8.4 → rounds to 8
    expect(calculateWateringInterval(baseRule, 'clay')).toBe(8);
  });

  it('shortens interval for high water need', () => {
    const rule = { ...baseRule, watering: { ...baseRule.watering, waterNeed: 'high' as const } };
    // 7 × 1.0 × 0.8 = 5.6 → rounds to 6
    expect(calculateWateringInterval(rule, 'loamy')).toBe(6);
  });

  it('lengthens interval for low water need', () => {
    const rule = { ...baseRule, watering: { ...baseRule.watering, waterNeed: 'low' as const } };
    // 7 × 1.0 × 1.2 = 8.4 → rounds to 8
    expect(calculateWateringInterval(rule, 'loamy')).toBe(8);
  });

  it('clamps to minimum of 1 day', () => {
    const rule = { ...baseRule, watering: { ...baseRule.watering, baseIntervalDays: 1, waterNeed: 'high' as const } };
    // 1 × 0.8 × 0.8 = 0.64 → rounds to 1 → clamped to 1
    expect(calculateWateringInterval(rule, 'sandy')).toBe(1);
  });

  it('uses loamy as default when no soil type provided', () => {
    expect(calculateWateringInterval(baseRule)).toBe(7);
  });
});

describe('generateWateringEvents', () => {
  it('returns empty array when watering is disabled', () => {
    const rule = { ...baseRule, watering: { ...baseRule.watering, enabled: false } };
    expect(generateWateringEvents(rule, new Date('2026-06-01'), new Date('2026-07-01'))).toHaveLength(0);
  });

  it('first event falls exactly one interval after planting date', () => {
    const events = generateWateringEvents(baseRule, new Date('2026-06-01'), new Date('2026-06-30'));
    expect(events.length).toBeGreaterThan(0);
    expect(events[0].date.toISOString().split('T')[0]).toBe('2026-06-08');
  });

  it('generates correct number of events for a 30-day window (7-day interval → 4 events)', () => {
    // June 8, 15, 22, 29 — all within June 1–July 1
    const events = generateWateringEvents(baseRule, new Date('2026-06-01'), new Date('2026-07-01'));
    expect(events).toHaveLength(4);
  });

  it('every event has type watering, status planned, and weatherAdjusted false', () => {
    const events = generateWateringEvents(baseRule, new Date('2026-06-01'), new Date('2026-07-01'));
    for (const e of events) {
      expect(e.type).toBe('watering');
      expect(e.status).toBe('planned');
      expect(e.weatherAdjusted).toBe(false);
    }
  });

  it('generates no events when endDate is before the first watering', () => {
    // Planted June 1, interval 7 days, but end is June 3 → no events
    const events = generateWateringEvents(baseRule, new Date('2026-06-01'), new Date('2026-06-03'));
    expect(events).toHaveLength(0);
  });
});
