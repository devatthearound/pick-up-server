import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';
import { ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  // 프론트엔드 주소가 환경변수에 제대로 설정되어 있는지 확인
  const frontendUrl = configService.get('FRONTEND_URL');
  console.log('Frontend URL:', frontendUrl); // 디버깅용
    
  // CORS 설정 - 배포된 프론트엔드 주소 명시적 추가
  app.enableCors({
    origin: [
      'https://www.xn--5h5bx6z0e.kr',
      'https://xn--5h5bx6z0e.kr',
      "https://픽업해.kr",
      "https://www.픽업해.kr",
      "https://ezpickup.kr",
      "https://www.ezpickup.kr",
      'http://localhost:3000'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposedHeaders: ['Authorization']
  });
  
  // 쿠키 파서 미들웨어 추가
  app.use(cookieParser());
  
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    transform: true,
  }));
  
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Swagger 설정은 그대로 유지
  const config = new DocumentBuilder()
    .setTitle('픽업 서버 API')
    .setDescription('픽업 서버 API 문서')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  fs.writeFileSync('./swagger-spec.json', JSON.stringify(document, null, 2));
  SwaggerModule.setup('api-docs', app, document);
  
  const port = configService.get('port') || 3001;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger API documentation is available at: http://localhost:${port}/api`);
}
bootstrap();