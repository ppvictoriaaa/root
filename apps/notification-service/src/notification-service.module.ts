import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderService } from './reminder.service';
import { ReminderScheduler } from './reminder.scheduler';
import { ReminderController } from './reminder.controller';
import { RedisProvider } from './redis.provider';
import {
  GardenNotificationSettings,
  GardenNotificationSettingsSchema,
} from './schemas/garden-notification-settings.schema';
import { UserProfile, UserProfileSchema } from './schemas/user-profile.schema';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          'MONGODB_URI_USERS',
          'mongodb://localhost:27017/garden-users',
        ),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: GardenNotificationSettings.name, schema: GardenNotificationSettingsSchema },
      { name: UserProfile.name, schema: UserProfileSchema },
    ]),
    HttpModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [ReminderController],
  providers: [ReminderService, ReminderScheduler, RedisProvider],
})
export class NotificationServiceModule {}
