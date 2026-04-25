import { NestFactory } from '@nestjs/core';
import { PlantServiceModule } from './plant-service.module';

async function bootstrap() {
  const app = await NestFactory.create(PlantServiceModule);
  await app.listen(process.env.port ?? 3000);
}
bootstrap();
