import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserProfileDocument = UserProfile & Document;

@Schema({ collection: 'userprofiles' })
export class UserProfile {
  @Prop({ required: true }) userId!: string;
  @Prop({ type: [String], default: [] }) verifiedEmails!: string[];
}

export const UserProfileSchema = SchemaFactory.createForClass(UserProfile);
