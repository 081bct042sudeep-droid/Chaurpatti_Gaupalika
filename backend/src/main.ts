import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded, static as expressStatic } from 'express';
import { join } from 'node:path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));
  app.use('/api/uploads/appeals', expressStatic(join(process.cwd(), 'uploads', 'appeals')));
  app.use('/api/uploads/map', expressStatic(join(process.cwd(), 'uploads', 'map')));
  app.use('/api/uploads/tourism', expressStatic(join(process.cwd(), 'uploads', 'tourism')));
  app.enableCors({ origin: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
