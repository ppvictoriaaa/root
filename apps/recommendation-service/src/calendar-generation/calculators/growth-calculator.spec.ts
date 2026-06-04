import { calculateGrowthDays } from './growth-calculator';

describe('calculateGrowthDays', () => {
  it('returns null when no normalDaysToHarvest is defined', () => {
    expect(calculateGrowthDays({ growth: {}, varietyType: 'none' })).toBeNull();
  });

  it('returns base days when varietyType is none', () => {
    expect(calculateGrowthDays({ growth: { normalDaysToHarvest: 60 }, varietyType: 'none' })).toBe(60);
  });

  it('returns base days when no variety is selected', () => {
    expect(calculateGrowthDays({ growth: { normalDaysToHarvest: 60 }, varietyType: 'ripening' })).toBe(60);
  });

  it('applies early ripening coefficient (×0.85)', () => {
    const result = calculateGrowthDays({ growth: { normalDaysToHarvest: 60 }, varietyType: 'ripening' }, 'early');
    expect(result).toBe(Math.round(60 * 0.85)); // 51
  });

  it('applies normal ripening coefficient (×1.00)', () => {
    const result = calculateGrowthDays({ growth: { normalDaysToHarvest: 60 }, varietyType: 'ripening' }, 'normal');
    expect(result).toBe(60);
  });

  it('applies late ripening coefficient (×1.15)', () => {
    const result = calculateGrowthDays({ growth: { normalDaysToHarvest: 60 }, varietyType: 'ripening' }, 'late');
    expect(result).toBe(Math.round(60 * 1.15)); // 69
  });

  it('applies summer harvest season coefficient (×0.90)', () => {
    const result = calculateGrowthDays({ growth: { normalDaysToHarvest: 100 }, varietyType: 'harvestSeason' }, 'summer');
    expect(result).toBe(Math.round(100 * 0.9)); // 90
  });

  it('applies winter harvest season coefficient (×1.20)', () => {
    const result = calculateGrowthDays({ growth: { normalDaysToHarvest: 100 }, varietyType: 'harvestSeason' }, 'winter');
    expect(result).toBe(Math.round(100 * 1.2)); // 120
  });

  it('ignores variety when varietyType is none even if variety is passed', () => {
    const result = calculateGrowthDays({ growth: { normalDaysToHarvest: 60 }, varietyType: 'none' }, 'early');
    expect(result).toBe(60);
  });
});
