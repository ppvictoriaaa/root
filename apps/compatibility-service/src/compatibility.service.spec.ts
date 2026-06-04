import { CompatibilityService } from './compatibility.service';
import type { PlantInput } from './compatibility.types';

describe('CompatibilityService', () => {
  let service: CompatibilityService;

  beforeEach(() => {
    service = new CompatibilityService();
  });

  it('returns no warnings for an empty plant list', () => {
    expect(service.evaluate([])).toEqual([]);
  });

  it('returns no warnings for a single plant', () => {
    const plants: PlantInput[] = [{ id: '1', slug: 'tomato', category: 'vegetable' }];
    expect(service.evaluate(plants)).toEqual([]);
  });

  it('detects tomato + potato high incompatibility', () => {
    const plants: PlantInput[] = [
      { id: '1', slug: 'tomato', category: 'vegetable' },
      { id: '2', slug: 'potato', category: 'vegetable' },
    ];
    const warnings = service.evaluate(plants);
    const w = warnings.find((x) => x.type === 'incompatible' && x.severity === 'high');
    expect(w).toBeDefined();
    expect(new Set([w!.plantAId, w!.plantBId])).toEqual(new Set(['1', '2']));
    expect(w!.effectRadiusM).toBe(10);
  });

  it('detects tomato + basil as good companions', () => {
    const plants: PlantInput[] = [
      { id: '1', slug: 'tomato', category: 'vegetable' },
      { id: '2', slug: 'basil', category: 'herb' },
    ];
    const warnings = service.evaluate(plants);
    expect(warnings.some((w) => w.type === 'good_companion')).toBe(true);
  });

  it('detects walnut + vegetable incompatibility via category rule', () => {
    const plants: PlantInput[] = [
      { id: '1', slug: 'walnut', category: 'tree' },
      { id: '2', slug: 'carrot', category: 'vegetable' },
    ];
    const warnings = service.evaluate(plants);
    const w = warnings.find((x) => x.type === 'incompatible');
    expect(w).toBeDefined();
    expect(w!.severity).toBe('high');
    expect(w!.effectRadiusM).toBe(15);
  });

  it('deduplicates walnut + berry (matches both walnut→berry and tree→berry rules)', () => {
    const plants: PlantInput[] = [
      { id: '1', slug: 'walnut', category: 'tree' },
      { id: '2', slug: 'strawberry', category: 'berry' },
    ];
    const incompatible = service.evaluate(plants).filter((w) => w.type === 'incompatible');
    // Two rules match the same pair — dedup must keep exactly one
    expect(incompatible).toHaveLength(1);
  });

  it('returns no incompatibilities for carrot + pepper', () => {
    const plants: PlantInput[] = [
      { id: '1', slug: 'carrot', category: 'vegetable' },
      { id: '2', slug: 'pepper', category: 'vegetable' },
    ];
    const incompatible = service.evaluate(plants).filter((w) => w.type === 'incompatible');
    expect(incompatible).toHaveLength(0);
  });

  it('detects mint incompatibility with vegetable via category rule', () => {
    const plants: PlantInput[] = [
      { id: '1', slug: 'mint', category: 'herb' },
      { id: '2', slug: 'tomato', category: 'vegetable' },
    ];
    const w = service.evaluate(plants).find((x) => x.type === 'incompatible');
    expect(w).toBeDefined();
    expect(w!.severity).toBe('medium');
  });
});
