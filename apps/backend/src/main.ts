import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { 
    cors: {
      origin: [
        'http://localhost:3000',
        'http://localhost:3001',
        'http://localhost:8080',
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'https://caffio-project.vercel.app', // Frontend on Vercel (без слеша в конце!)
      ],
      credentials: true,
    }
  });

  const config = new DocumentBuilder()
    .setTitle('Caffio API')
    .setDescription('Caffio platform API documentation')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3000);
}

bootstrap();

