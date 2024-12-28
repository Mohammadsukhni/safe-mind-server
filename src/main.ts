import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { Logger, ValidationPipe } from '@nestjs/common';
import { EnvVariables } from './configurations/configuration.interface';
import { SetupSwagger } from './configurations/swagger.config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    cors: { exposedHeaders: 'x-total-count' },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      skipMissingProperties: false,
      forbidUnknownValues: true,
      forbidNonWhitelisted: true,
      whitelist: true,
      transform: true,
    }),
  );

  SetupSwagger(app);

  const configService = app.get(ConfigService<EnvVariables>);

  await app.listen(configService.get('PORT'));

  Logger.verbose(
    `Server URL http://${configService.get('URL')}${
      configService.get('ENV') === 'development'
        ? `:${configService.get('PORT')}`
        : ''
    }`,
    'NestApplication',
  );

  Logger.verbose(
    `Api Documentation http://${configService.get('URL')}${
      configService.get('ENV') === 'development'
        ? `:${configService.get('PORT')}`
        : ''
    }/api/docs`,
    'NestApplication',
  );
}

bootstrap();
