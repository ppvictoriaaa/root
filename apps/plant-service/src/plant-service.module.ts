import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PlantsController } from './plants/plants.controller';
import { PlantsService } from './plants/plants.service';
import { Plant, PlantSchema } from './plants/schemas/plant.schema';

@Module({
  imports: [
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
  providers: [PlantsService],
})
export class PlantServiceModule {}
