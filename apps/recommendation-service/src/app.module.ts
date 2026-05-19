import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { ScheduleModule } from '@nestjs/schedule';
import { PlantCareRulesModule } from './plant-care-rules/plant-care-rules.module';
import { CareCalendarModule } from './care-calendar/care-calendar.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          'MONGODB_URI_RECOMMENDATIONS',
          'mongodb://localhost:27017/garden-recommendations',
        ),
      }),
      inject: [ConfigService],
    }),
    PlantCareRulesModule,
    CareCalendarModule,
  ],
})
export class AppModule {}
