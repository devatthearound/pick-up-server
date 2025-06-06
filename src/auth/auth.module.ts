// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UserSession } from '../session/entities/user-session.entity';
import { ConfigService } from '@nestjs/config';
import { RolesGuard } from './guards/roles.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { PassportModule } from '@nestjs/passport';
import { SessionService } from '../session/session.service';
import { SmsService } from '../service/smsFunction';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    TypeOrmModule.forFeature([User, UserSession]),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRATION') },
      }),
    }),
  ],
  providers: [
    AuthService, 
    JwtStrategy, 
    RolesGuard, 
    JwtAuthGuard,
    SessionService,
    SmsService
  ],
  controllers: [AuthController],
  exports: [AuthService, JwtStrategy, RolesGuard, JwtAuthGuard, SessionService, SmsService],
})
export class AuthModule {}