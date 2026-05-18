export type RuleFilter = { plant: string } | { category: string };

export interface Rule {
  source: RuleFilter;
  target: RuleFilter;
  type: 'incompatible' | 'good_companion';
  severity: 'high' | 'medium' | 'low';
  reason: string;
}

export const RULES: Rule[] = [
  // 1. Incompatibility — shared diseases / pests
  {
    source: { plant: 'tomato' },
    target: { plant: 'potato' },
    type: 'incompatible',
    severity: 'high',
    reason: 'These plants may share fungal diseases and pests.',
  },
  {
    source: { plant: 'pepper' },
    target: { plant: 'potato' },
    type: 'incompatible',
    severity: 'medium',
    reason:
      'These plants belong to the same family and may compete for nutrients.',
  },
  {
    source: { plant: 'carrot' },
    target: { plant: 'dill' },
    type: 'incompatible',
    severity: 'medium',
    reason: 'Dill in large amounts may inhibit carrot growth.',
  },
  // 2. Competition — water / nutrients / shade
  {
    source: { plant: 'walnut' },
    target: { category: 'vegetable' },
    type: 'incompatible',
    severity: 'high',
    reason: 'Walnut trees may suppress the growth of nearby plants.',
  },
  {
    source: { plant: 'walnut' },
    target: { category: 'berry' },
    type: 'incompatible',
    severity: 'high',
    reason: 'Walnut trees may suppress the growth of nearby plants.',
  },
  {
    source: { category: 'tree' },
    target: { category: 'berry' },
    type: 'incompatible',
    severity: 'medium',
    reason: 'Trees may create shade and compete for water.',
  },
  // 3. Aggressive spreading
  {
    source: { plant: 'mint' },
    target: { category: 'vegetable' },
    type: 'incompatible',
    severity: 'medium',
    reason: 'Mint spreads aggressively and may suppress nearby plants.',
  },
  {
    source: { plant: 'mint' },
    target: { category: 'flower' },
    type: 'incompatible',
    severity: 'medium',
    reason: 'Mint spreads aggressively and may suppress nearby plants.',
  },
  // 4. Good companions
  {
    source: { plant: 'tomato' },
    target: { plant: 'basil' },
    type: 'good_companion',
    severity: 'low',
    reason: 'Basil may help repel pests near tomatoes.',
  },
  {
    source: { plant: 'tomato' },
    target: { plant: 'onion' },
    type: 'good_companion',
    severity: 'low',
    reason: 'Onions may help deter pests near tomatoes.',
  },
  {
    source: { plant: 'carrot' },
    target: { plant: 'onion' },
    type: 'good_companion',
    severity: 'low',
    reason: 'Onions may help protect carrots from pests.',
  },
  {
    source: { plant: 'carrot' },
    target: { plant: 'rosemary' },
    type: 'good_companion',
    severity: 'low',
    reason: 'Rosemary may repel carrot fly.',
  },
  {
    source: { plant: 'pepper' },
    target: { plant: 'basil' },
    type: 'good_companion',
    severity: 'low',
    reason: 'Basil may improve pepper growth and repel aphids.',
  },
  {
    source: { plant: 'pepper' },
    target: { plant: 'carrot' },
    type: 'good_companion',
    severity: 'low',
    reason: 'Carrots and peppers can coexist well and make good use of space.',
  },
  {
    source: { plant: 'potato' },
    target: { plant: 'onion' },
    type: 'good_companion',
    severity: 'low',
    reason: 'Onions may help deter some potato pests.',
  },
];
