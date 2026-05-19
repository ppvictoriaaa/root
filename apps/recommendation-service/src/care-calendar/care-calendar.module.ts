import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CareCalendarEvent, CareCalendarEventSchema } from './schemas/care-calendar-event.schema';
import { CareCalendarMeta, CareCalendarMetaSchema } from './schemas/care-calendar-meta.schema';
import { CareCalendarController } from './care-calendar.controller';
import { CareCalendarService } from './care-calendar.service';
import { WeatherRefreshService } from './weather-refresh.service';
import { CalendarGenerationModule } from '../calendar-generation/calendar-generation.module';
import { WeatherModule } from '../weather/weather.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CareCalendarEvent.name, schema: CareCalendarEventSchema },
      { name: CareCalendarMeta.name, schema: CareCalendarMetaSchema },
    ]),
    CalendarGenerationModule,
    WeatherModule,
  ],
  controllers: [CareCalendarController],
  providers: [CareCalendarService, WeatherRefreshService],
})
export class CareCalendarModule {}
