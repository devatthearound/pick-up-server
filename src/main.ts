import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // CORS 설정
  app.enableCors({
    origin: [
      configService.get('FRONTEND_URL'),
      'http://localhost:3001',
    ],
    credentials: true,
  });
  
  // 쿠키 파서 미들웨어 추가
  app.use(cookieParser());
  

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Swagger API 문서화 설정
  const config = new DocumentBuilder()
    .setTitle('픽업 서버 API')
    .setDescription('픽업 서버 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);
  
  const port = configService.get('port') || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger API documentation is available at: http://localhost:${port}/api`);
}
bootstrap();
