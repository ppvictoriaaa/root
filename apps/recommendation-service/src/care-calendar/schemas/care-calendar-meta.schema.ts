import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CareCalendarMetaDocument = CareCalendarMeta & Document;

@Schema({ _id: false })
class LocationData {
  @Prop({ required: true }) latitude!: number;
  @Prop({ required: true }) longitude!: number;
  @Prop() city?: string;
}

const LocationDataSchema = SchemaFactory.createForClass(LocationData);

// One document per garden — stores context needed for weather refresh.
@Schema({ collection: 'careCalendarMeta', timestamps: true })
export class CareCalendarMeta {
  @Prop({ required: true, unique: true, index: true }) gardenId!: string;
  @Prop({ required: true }) userId!: string;
  @Prop({ type: LocationDataSchema, required: true }) location!: LocationData;
  @Prop({ type: String }) soilType?: string;
  @Prop({ required: true, type: Date }) lastGeneratedAt!: Date;
  @Prop({ type: Date }) lastWeatherRefreshAt?: Date;
}

export const CareCalendarMetaSchema = SchemaFactory.createForClass(CareCalendarMeta);
