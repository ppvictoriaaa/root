import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserProfileDocument = UserProfile & Document;

@Schema({ timestamps: true })
export class UserProfile {
  @Prop({ required: true, unique: true })
  userId!: string;

  @Prop({ default: '' })
  name!: string;

  @Prop({ default: '' })
  avatarUrl!: string;

  @Prop({ type: [String], default: [] })
  gardenIds!: string[];

  @Prop({
    type: {
      emailNotifications: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
    },
    default: {},
  })
  notificationPreferences!: {
    emailNotifications: boolean;
    pushNotifications: boolean;
  };
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
