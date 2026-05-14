import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GardensController } from './gardens.controller';
import { GardensService } from './gardens.service';
import { Garden, GardenSchema } from './schemas/garden.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: Garden.name, schema: GardenSchema }])],
  controllers: [GardensController],
  providers: [GardensService],
})
export class GardensModule {}
