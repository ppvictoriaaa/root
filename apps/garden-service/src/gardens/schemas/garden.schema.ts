import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ _id: false })
export class PlacedPlantDoc {
  @Prop({ required: true }) id!: string;
  @Prop({ required: true }) plantId!: string;
  @Prop({ required: true }) name!: string;
  @Prop({ required: true }) slug!: string;
  @Prop() category?: string;
  @Prop() color?: string;
  @Prop() imageUrl?: string;
  @Prop({ required: true }) x!: number;
  @Prop({ required: true }) y!: number;
  @Prop({ required: true }) count!: number;
  @Prop({ required: true }) plantsPerRow!: number;
  @Prop({ required: true }) spacing!: number;
  @Prop() variety?: string;
  @Prop() plantedAt?: string;
  @Prop() customName?: string;
}

export const PlacedPlantDocSchema = SchemaFactory.createForClass(PlacedPlantDoc);

export type GardenDocument = Garden & Document;

@Schema({ timestamps: true })
export class Garden {
  @Prop({ required: true }) userId!: string;
  @Prop({ required: true }) name!: string;
  @Prop({ type: [PlacedPlantDocSchema], default: [] }) placedPlants!: PlacedPlantDoc[];
  @Prop({ required: true }) plotWidthM!: number;
  @Prop({ required: true }) plotHeightM!: number;
  @Prop({ required: true }) metersPerCell!: number;
}

export const GardenSchema = SchemaFactory.createForClass(Garden);
