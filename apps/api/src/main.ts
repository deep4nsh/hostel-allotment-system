import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet());
  app.enableCors();
  // Changed default port to 3001 to match frontend configuration
  await app.listen(process.env.PORT ?? 4000);
}
bootstrap();
