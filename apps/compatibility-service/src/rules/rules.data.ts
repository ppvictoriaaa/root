export type RuleFilter = { plant: string } | { category: string };

export interface Rule {
  source: RuleFilter;
  target: RuleFilter;
  type: 'incompatible' | 'good_companion';
  severity: 'high' | 'medium' | 'low';
  effectRadiusM?: number;
  reason: string;
}

export const RULES: Rule[] = [
  // =========================================================
  // INCOMPATIBLE PLANTS
  // =========================================================
  {
    source: { plant: 'tomato' },
    target: { plant: 'potato' },
    type: 'incompatible',
    severity: 'high',
    effectRadiusM: 10,
    reason:
      'Tomatoes and potatoes may spread fungal diseases and pests to each other.',
  },
  {
    source: { plant: 'pepper' },
    target: { plant: 'potato' },
    type: 'incompatible',
    severity: 'medium',
    effectRadiusM: 6,
    reason:
      'Peppers and potatoes belong to the same family and may attract similar pests.',
  },
  {
    source: { plant: 'carrot' },
    target: { plant: 'dill' },
    type: 'incompatible',
    severity: 'medium',
    effectRadiusM: 3,
    reason: 'Large dill plants may inhibit carrot root development nearby.',
  },
  {
    source: { plant: 'walnut' },
    target: { category: 'vegetable' },
    type: 'incompatible',
    severity: 'high',
    effectRadiusM: 15,
    reason:
      'Walnut trees release juglone, which may suppress nearby vegetables.',
  },
  {
    source: { plant: 'walnut' },
    target: { category: 'berry' },
    type: 'incompatible',
    severity: 'high',
    effectRadiusM: 15,
    reason:
      'Walnut trees release juglone, which may suppress nearby berry plants.',
  },
  {
    source: { category: 'tree' },
    target: { category: 'berry' },
    type: 'incompatible',
    severity: 'medium',
    effectRadiusM: 8,
    reason: 'Large trees may create excessive shade and compete for water.',
  },
  {
    source: { plant: 'mint' },
    target: { category: 'vegetable' },
    type: 'incompatible',
    severity: 'medium',
    effectRadiusM: 4,
    reason: 'Mint spreads aggressively and may overcrowd nearby vegetables.',
  },
  {
    source: { plant: 'mint' },
    target: { category: 'flower' },
    type: 'incompatible',
    severity: 'medium',
    effectRadiusM: 4,
    reason: 'Mint spreads aggressively and may suppress nearby flowers.',
  },

  // =========================================================
  // GOOD COMPANIONS
  // =========================================================
  {
    source: { plant: 'tomato' },
    target: { plant: 'basil' },
    type: 'good_companion',
    severity: 'low',
    effectRadiusM: 2,
    reason: 'Basil may help repel pests and support healthy tomato growth.',
  },
  {
    source: { plant: 'tomato' },
    target: { plant: 'onion' },
    type: 'good_companion',
    severity: 'low',
    effectRadiusM: 3,
    reason: 'Onions may help deter pests that affect tomatoes.',
  },
  {
    source: { plant: 'carrot' },
    target: { plant: 'onion' },
    type: 'good_companion',
    severity: 'low',
    effectRadiusM: 3,
    reason: 'Onions may help protect carrots from carrot flies.',
  },
  {
    source: { plant: 'carrot' },
    target: { plant: 'rosemary' },
    type: 'good_companion',
    severity: 'low',
    effectRadiusM: 3,
    reason: 'Rosemary aroma may help repel carrot flies.',
  },
  {
    source: { plant: 'pepper' },
    target: { plant: 'basil' },
    type: 'good_companion',
    severity: 'low',
    effectRadiusM: 2,
    reason: 'Basil may help repel aphids and support pepper growth.',
  },
  {
    source: { plant: 'pepper' },
    target: { plant: 'carrot' },
    type: 'good_companion',
    severity: 'low',
    effectRadiusM: 3,
    reason:
      'Peppers and carrots usually coexist well and use space efficiently.',
  },
  {
    source: { plant: 'potato' },
    target: { plant: 'onion' },
    type: 'good_companion',
    severity: 'low',
    effectRadiusM: 3,
    reason: 'Onions may help deter some pests that affect potatoes.',
  },
];
