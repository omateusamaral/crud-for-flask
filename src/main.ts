import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { writeFileSync } from 'fs';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const config = new DocumentBuilder()
    .setTitle('Stock Control API')
    .setDescription('CRUD de produtos com NestJS, TypeORM e SQLite')
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
      },
      'x-api-key',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  writeFileSync(
    join(process.cwd(), 'swagger.json'),
    JSON.stringify(document, null, 2),
  );
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(3001);
  console.log('✅ API rodando em http://localhost:3001');
  console.log('📘 Swagger UI: http://localhost:3001/api/docs');
}
bootstrap();
