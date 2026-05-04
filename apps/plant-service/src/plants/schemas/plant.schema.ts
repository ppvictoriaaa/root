import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PlantDocument = Plant & Document;

@Schema({ timestamps: true })
export class Plant {
  @Prop({ required: true, unique: true })
  name!: string;

  @Prop({ required: true, unique: true })
  slug!: string;

  @Prop({ required: true })
  category!: string;

  @Prop({ default: '' })
  imageUrl!: string;
}

export const PlantSchema = SchemaFactory.createForClass(Plant);
