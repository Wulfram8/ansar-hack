import * as crypto from 'crypto';
(global as any).crypto = crypto;

import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters';
import { TransformInterceptor } from './common/interceptors';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix
  app.setGlobalPrefix('api/v1');

  // CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  // Global pipes
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger / OpenAPI
  const config = new DocumentBuilder()
    .setTitle('CRM API')
    .setDescription('Full-featured CRM REST API with flexible schema support')
    .setVersion('1.0')
    .addBearerAuth()
    .addApiKey({ type: 'apiKey', name: 'X-API-Key', in: 'header' }, 'api-key')
    .addTag('Auth', 'Authentication & registration')
    .addTag('API Tokens', 'Developer API token management')
    .addTag('Users', 'User management (Admin)')
    .addTag('Schemas', 'Flexible entity schema management')
    .addTag('Records', 'Dynamic entity records')
    .addTag('Contacts', 'Contact management')
    .addTag('Leads', 'Lead pipeline management')
    .addTag('Opportunities', 'Deal/opportunity tracking')
    .addTag('Tasks', 'Task management')
    .addTag('Calendar', 'Calendar events')
    .addTag('Email', 'Email management')
    .addTag('Files', 'File upload & management')
    .addTag('Reports', 'Report builder & execution')
    .addTag('Dashboard', 'Dashboard widgets & data')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 CRM API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api/docs`);
}

bootstrap();
