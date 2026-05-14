import { Body, Controller, Post } from '@nestjs/common';
import { RecommendationService } from './recommendation.service';
import type { RecommendationRequest, RecommendationResponse } from './recommendation.types';

@Controller('recommendations')
export class RecommendationController {
  constructor(private readonly service: RecommendationService) {}

  @Post()
  evaluate(@Body() body: RecommendationRequest): RecommendationResponse {
    return { warnings: this.service.evaluate(body.plants ?? []) };
  }
}
