import { Request } from 'express';

export interface PlacedPlantItem {
  id: string;
  plantId: string;
  name: string;
  slug: string;
  category?: string;
  color?: string;
  imageUrl?: string;
  x: number;
  y: number;
  count: number;
  plantsPerRow: number;
  spacing: number;
}

export interface Garden {
  _id: string;
  userId: string;
  name: string;
  placedPlants: PlacedPlantItem[];
  plotWidthM: number;
  plotHeightM: number;
  metersPerCell: number;
}

export interface RequestWithUser extends Request {
  user: { sub: string; email: string };
}
