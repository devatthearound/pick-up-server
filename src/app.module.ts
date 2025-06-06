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
import { OptionModule } from './menu/option.module';
import { MenuModule } from './menu/menu.module';
import { MenuAvailabilityModule } from './menu/menu-availability.module';
import { StoreBenefitModule } from './store/store-benefit.module';
import { OrderModule } from './order/order.module';
import { NotificationModule } from './notification/notification.module';
import { SessionModule } from './session/session.module';
import { InitModule } from './init/init.module';
// crypto 모듈을 전역으로 사용할 수 있도록 설정

// crypto 객체 설정을 수정
if (!global.crypto) {
  (global as any).crypto = crypto;
}
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
        synchronize: false,
        logging: false,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    StoreModule,
    SchedulerModule,
    MenuModule,
    OptionModule,
    MenuAvailabilityModule,
    StoreBenefitModule,
    OrderModule,
    NotificationModule,
    SessionModule,
    InitModule, 
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}