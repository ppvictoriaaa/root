import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { PlantsController } from './plants.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [PlantsController],
})
export class PlantsModule {}
