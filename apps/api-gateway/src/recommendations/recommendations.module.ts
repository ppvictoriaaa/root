import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { RecommendationsController } from './recommendations.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [RecommendationsController],
})
export class RecommendationsModule {}
