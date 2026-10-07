import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded, static as expressStatic } from 'express';
import { mkdir } from 'node:fs/promises';
import { AppModule } from './app.module';
import { uploadDirectory } from './upload-storage';

async function bootstrap() {
  const uploadAreas = ['appeals', 'map', 'tourism', 'notices'] as const;
  await Promise.all(uploadAreas.map((area) => mkdir(uploadDirectory(area), { recursive: true })));
  const app = await NestFactory.create(AppModule);
  app.use(json({ limit: '15mb' }));
  app.use(urlencoded({ extended: true, limit: '15mb' }));
  app.use('/api/uploads/appeals', expressStatic(uploadDirectory('appeals')));
  app.use('/api/uploads/map', expressStatic(uploadDirectory('map')));
  app.use('/api/uploads/tourism', expressStatic(uploadDirectory('tourism')));
  app.use('/api/uploads/notices', expressStatic(uploadDirectory('notices')));
  app.enableCors({ origin: true });
  app.setGlobalPrefix('api');
  app.useGlobalPipes(new ValidationPipe({ transform: true, whitelist: true }));
  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
