import { Body, Controller, Post } from '@nestjs/common';
import { CompatibilityService } from './compatibility.service';
import type { CompatibilityRequest, CompatibilityResponse } from './compatibility.types';

@Controller('compatibility')
export class CompatibilityController {
  constructor(private readonly service: CompatibilityService) {}

  @Post()
  evaluate(@Body() body: CompatibilityRequest): CompatibilityResponse {
    return { warnings: this.service.evaluate(body.plants ?? []) };
  }
}
