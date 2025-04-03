import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { StoreModule } from './store/store.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import * as crypto from 'crypto';

// crypto 모듈을 전역으로 사용할 수 있도록 설정
(global as any).crypto = crypto;

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.database'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: process.env.NODE_ENV !== 'production', // 개발 환경에서만 true
        logging: process.env.NODE_ENV !== 'production',
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    StoreModule,
    SchedulerModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}