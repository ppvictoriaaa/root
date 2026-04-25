import { Module } from '@nestjs/common';
import { PlantServiceController } from './plant-service.controller';
import { PlantServiceService } from './plant-service.service';

@Module({
  imports: [],
  controllers: [PlantServiceController],
  providers: [PlantServiceService],
})
export class PlantServiceModule {}
