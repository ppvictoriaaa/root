import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { GardenServiceModule } from './garden-service.module';

async function bootstrap() {
  const app = await NestFactory.create(GardenServiceModule);
  app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
  await app.listen(process.env.PORT ?? 3005);
}
bootstrap();
