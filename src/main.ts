import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({ transform: true, stopAtFirstError: true }),
  );
  setupSwagger(app);
  await app.listen(3000);
}

void bootstrap();

function setupSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('UUID Server')
    .setDescription('An API for generating and parsing UUIDs.')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'UUID Server API',
  });
}
