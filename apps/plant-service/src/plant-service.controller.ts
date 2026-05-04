import { Controller, Get } from '@nestjs/common';

@Controller()
export class PlantServiceController {
  @Get('health')
  health() {
    return { status: 'ok' };
  }
}
