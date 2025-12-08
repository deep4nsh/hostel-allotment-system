import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }));
  app.enableCors();
  // Changed default port to 3001 to match frontend configuration
  // Force port 4000 to avoid conflicts and match frontend
  await app.listen(4000);
}
bootstrap();
