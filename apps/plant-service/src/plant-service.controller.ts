import { Controller, Get } from '@nestjs/common';
import { PlantServiceService } from './plant-service.service';

@Controller()
export class PlantServiceController {
  constructor(private readonly plantServiceService: PlantServiceService) {}

  @Get()
  getHello(): string {
    return this.plantServiceService.getHello();
  }
}
