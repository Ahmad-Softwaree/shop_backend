import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { ConfigService } from '@nestjs/config';
import { GlobalExceptionFilter } from './common/filters/global-exception.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { LanguageService } from './language/language.service';
import { Logger } from 'nestjs-pino';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: [app.get(ConfigService).get('FRONT_URL')],
    credentials: true,
    preflightContinue: false,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'x-lang'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  });
  const languageService = app.get(LanguageService);

  app.useLogger(app.get(Logger));
  app.useGlobalPipes(new CustomValidationPipe(languageService));
  app.useGlobalFilters(new GlobalExceptionFilter(), new HttpExceptionFilter());
  app.use(helmet({}));
  app.use(compression());
  app.use(cookieParser());

  await app.listen(app.get(ConfigService).get('PORT') || 3001);
  console.log(
    `🚀 Server ready at http://localhost:${app.get(ConfigService).get('PORT') || 3001}`,
  );
}
bootstrap().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
