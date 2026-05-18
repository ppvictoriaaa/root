import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CompatibilityController } from './compatibility.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  controllers: [CompatibilityController],
})
export class CompatibilityModule {}
