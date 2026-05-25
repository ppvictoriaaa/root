import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type GardenNotificationSettingsDocument = GardenNotificationSettings & Document;

@Schema({ timestamps: true })
export class GardenNotificationSettings {
  @Prop({ required: true, index: true })
  userId!: string;

  @Prop({ required: true, index: true })
  gardenId!: string;

  @Prop({ default: '' })
  notificationEmail!: string;

  @Prop({ default: 0 })
  daysBefore!: number;

  @Prop({ default: '09:00' })
  time!: string;
}

export const GardenNotificationSettingsSchema = SchemaFactory.createForClass(GardenNotificationSettings);
GardenNotificationSettingsSchema.index({ userId: 1, gardenId: 1 }, { unique: true });
