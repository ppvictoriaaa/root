import { NestFactory } from '@nestjs/core';
import { RecommendationModule } from './recommendation.module';

async function bootstrap() {
  const app = await NestFactory.create(RecommendationModule);
  await app.listen(process.env.PORT ?? 3004);
  console.log('Recommendation service running on port 3004');
}
bootstrap();
