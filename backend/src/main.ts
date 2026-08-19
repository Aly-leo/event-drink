import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

const LOCALHOST_ORIGIN = /^https?:\/\/localhost:\d+$/;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const config = app.get(ConfigService);

  const isProd = config.get<string>('NODE_ENV') === 'production';
  app.enableCors({
    origin: isProd ? config.get<string>('FRONT_URL', 'http://localhost:4200') : LOCALHOST_ORIGIN,
  });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const port = config.get<number>('PORT', 3000);
  await app.listen(port);
}

bootstrap();
