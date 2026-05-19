import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlantCareRuleDocument = PlantCareRule & Document;

@Schema({ _id: false })
class GrowthConfig {
  @Prop() normalDaysToHarvest?: number;
  @Prop() isPerennial?: boolean;
  @Prop() estimatedLifespanYears?: number;
}

const GrowthConfigSchema = SchemaFactory.createForClass(GrowthConfig);

@Schema({ _id: false })
class WateringConfig {
  @Prop({ required: true }) enabled!: boolean;
  @Prop() baseIntervalDays?: number;
  @Prop({ type: String }) waterNeed?: 'low' | 'medium' | 'high';
}

const WateringConfigSchema = SchemaFactory.createForClass(WateringConfig);

@Schema({ _id: false })
class FertilizingConfig {
  @Prop({ required: true }) enabled!: boolean;
  @Prop() baseIntervalDays?: number;
  @Prop() firstFertilizingAfterDays?: number;
}

const FertilizingConfigSchema = SchemaFactory.createForClass(FertilizingConfig);

@Schema({ _id: false })
class HarvestingConfig {
  @Prop({ required: true }) enabled!: boolean;
}

const HarvestingConfigSchema = SchemaFactory.createForClass(HarvestingConfig);

@Schema({ collection: 'plantCareRules', timestamps: true })
export class PlantCareRule {
  @Prop({ required: true, unique: true, index: true }) plantSlug!: string;
  @Prop({ required: true, type: String }) category!: string;
  @Prop({ required: true, default: false }) supportsVarieties!: boolean;
  @Prop({ required: true, type: String, default: 'none' }) varietyType!: string;
  @Prop({ type: [String], default: [] }) allowedVarieties!: string[];
  @Prop({ type: GrowthConfigSchema, default: {} }) growth!: GrowthConfig;
  @Prop({ type: WateringConfigSchema, required: true }) watering!: WateringConfig;
  @Prop({ type: FertilizingConfigSchema, required: true }) fertilizing!: FertilizingConfig;
  @Prop({ type: HarvestingConfigSchema, required: true }) harvesting!: HarvestingConfig;
  @Prop() notes?: string;
}

export const PlantCareRuleSchema = SchemaFactory.createForClass(PlantCareRule);
