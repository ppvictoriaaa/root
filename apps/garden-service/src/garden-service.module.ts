import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { GardensModule } from './gardens/gardens.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          'MONGODB_URI_GARDENS',
          'mongodb://localhost:27017/garden-gardens',
        ),
      }),
      inject: [ConfigService],
    }),
    GardensModule,
  ],
})
export class GardenServiceModule {}
