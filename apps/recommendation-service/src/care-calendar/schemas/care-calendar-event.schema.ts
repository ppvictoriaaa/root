import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CareCalendarEventDocument = CareCalendarEvent & Document;

@Schema({ _id: false })
class EventMetadata {
  @Prop() variety?: string;
  @Prop() soilType?: string;
  @Prop({ type: Date }) originalDate?: Date;
  @Prop() shiftReason?: string;
  @Prop() temperature?: number;
  @Prop() precipitation?: number;
  @Prop() precipitationPrevDay?: number;
  @Prop() heatDays?: number;
}

const EventMetadataSchema = SchemaFactory.createForClass(EventMetadata);

@Schema({ collection: 'careCalendarEvents', timestamps: true })
export class CareCalendarEvent {
  @Prop({ required: true, index: true }) userId!: string;
  @Prop({ required: true, index: true }) gardenId!: string;
  @Prop({ required: true }) plantSlug!: string;
  @Prop({ required: true, type: String }) type!: string;
  @Prop({ required: true }) title!: string;
  @Prop() description?: string;
  @Prop({ required: true, index: true, type: Date }) date!: Date;
  @Prop({ required: true, type: String, default: 'planned' }) status!: string;
  @Prop({ required: true, type: String, default: 'base' }) source!: string;
  @Prop({ required: true, default: false }) weatherAdjusted!: boolean;
  @Prop({ required: true, type: String, default: 'estimated' }) accuracyLevel!: string;
  @Prop({ type: EventMetadataSchema, default: {} }) metadata!: EventMetadata;
}

export const CareCalendarEventSchema = SchemaFactory.createForClass(CareCalendarEvent);
