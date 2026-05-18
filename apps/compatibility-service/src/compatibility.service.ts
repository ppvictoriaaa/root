import { Injectable } from '@nestjs/common';
import { RULES, type RuleFilter } from './rules/rules.data';
import type { PlantInput, PlantWarning } from './compatibility.types';

@Injectable()
export class CompatibilityService {
  evaluate(plants: PlantInput[]): PlantWarning[] {
    const warnings: PlantWarning[] = [];

    for (const rule of RULES) {
      const sources = this.matchFilter(plants, rule.source);
      const targets = this.matchFilter(plants, rule.target);

      for (const a of sources) {
        for (const b of targets) {
          if (a.id === b.id) continue;
          warnings.push({
            type: rule.type,
            severity: rule.severity,
            reason: rule.reason,
            plantAId: a.id,
            plantBId: b.id,
          });
        }
      }
    }

    return this.deduplicate(warnings);
  }

  private matchFilter(plants: PlantInput[], filter: RuleFilter): PlantInput[] {
    if ('plant' in filter) return plants.filter((p) => p.slug === filter.plant);
    return plants.filter((p) => p.category === filter.category);
  }

  private deduplicate(warnings: PlantWarning[]): PlantWarning[] {
    const seen = new Set<string>();
    return warnings.filter((w) => {
      const key = `${w.type}|${[w.plantAId, w.plantBId].sort().join('|')}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }
}
