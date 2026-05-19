import { Module } from '@nestjs/common';
import { CalendarGenerationService } from './calendar-generation.service';
import { PlantCareRulesModule } from '../plant-care-rules/plant-care-rules.module';
import { WeatherModule } from '../weather/weather.module';
import { GardenClientModule } from '../garden-client/garden-client.module';

@Module({
  imports: [PlantCareRulesModule, WeatherModule, GardenClientModule],
  providers: [CalendarGenerationService],
  exports: [CalendarGenerationService],
})
export class CalendarGenerationModule {}
