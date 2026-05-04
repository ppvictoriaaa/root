import { NestFactory } from '@nestjs/core';
import { PlantServiceModule } from './plant-service.module';

async function bootstrap() {
  const app = await NestFactory.create(PlantServiceModule);
  await app.listen(process.env.PORT ?? 3003);
}
bootstrap();
