import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { GardenClientService } from './garden-client.service';

@Module({
  imports: [HttpModule],
  providers: [GardenClientService],
  exports: [GardenClientService],
})
export class GardenClientModule {}
