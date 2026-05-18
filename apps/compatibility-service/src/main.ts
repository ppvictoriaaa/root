import { NestFactory } from '@nestjs/core';
import { CompatibilityModule } from './compatibility.module';

async function bootstrap() {
  const app = await NestFactory.create(CompatibilityModule);
  await app.listen(process.env.PORT ?? 3004);
  console.log('Compatibility service running on port 3004');
}
bootstrap();
