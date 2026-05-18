export interface PlantInput {
  id: string;
  slug: string;
  category: string;
}

export interface CompatibilityRequest {
  plants: PlantInput[];
}

export interface PlantWarning {
  type: 'incompatible' | 'good_companion';
  severity: 'high' | 'medium' | 'low';
  reason: string;
  plantAId: string;
  plantBId: string;
}

export interface CompatibilityResponse {
  warnings: PlantWarning[];
}
