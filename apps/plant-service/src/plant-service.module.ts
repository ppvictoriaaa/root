import { join } from 'path';
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlantsController } from './plants/plants.controller';
import { PlantsService } from './plants/plants.service';
import { Plant, PlantSchema } from './plants/schemas/plant.schema';
import { RedisProvider } from './redis.provider';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'dist', 'apps', 'plant-service', 'public'),
      serveRoot: '/',
    }),
    ConfigModule.forRoot({ isGlobal: true }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>(
          'MONGODB_URI_PLANTS',
          'mongodb://localhost:27017/garden-plants',
        ),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: Plant.name, schema: PlantSchema }]),
  ],
  controllers: [PlantsController],
  providers: [PlantsService, RedisProvider],
})
export class PlantServiceModule {}
