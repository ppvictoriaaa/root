import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PlantsController } from './plants.controller';
import { PlantIconsController } from './plant-icons.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PlantsController, PlantIconsController],
})
export class PlantsModule {}
