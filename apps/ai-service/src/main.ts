import { NestFactory } from '@nestjs/core';
import { AiServiceModule } from './ai-service.module';

async function bootstrap() {
  const app = await NestFactory.create(AiServiceModule);
  app.enableCors();
  await app.listen(3008);
  console.log('AI Service running on port 3008');
}

void bootstrap();
