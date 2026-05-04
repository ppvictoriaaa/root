import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { PlantsController } from './plants.controller';

@Module({
  imports: [HttpModule],
  controllers: [PlantsController],
})
export class PlantsModule {}
