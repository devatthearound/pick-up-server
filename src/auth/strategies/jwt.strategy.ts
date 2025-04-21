// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';
import { UserSession } from '../../session/entities/user-session.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    try {
      // 1. 사용자 조회 및 활성 상태 확인
      const user = await this.usersRepository.findOne({ 
        where: { id: payload.sub, isActive: true },
        relations: ['customerProfile', 'ownerProfile'],
      });

      if (!user) {
        throw new UnauthorizedException('사용자를 찾을 수 없거나 비활성화된 계정입니다');
      }

      console.log('payload', payload);
      // 2. 세션 유효성 확인
      const session = await this.sessionRepository.findOne({
        where: { 
          id: payload.sessionId,
          isValid: true,
          userId: user.id
        }
      });

      if (!session) {
        throw new UnauthorizedException('유효하지 않은 세션입니다');
      }

      // 3. 세션 만료 확인
      if (session.expiresAt < new Date()) {
        session.isValid = false;
        await this.sessionRepository.save(session);
        throw new UnauthorizedException('세션이 만료되었습니다');
      }

      // 4. 세션 마지막 활동 시간 업데이트
      session.lastActivityAt = new Date();
      await this.sessionRepository.save(session);

      // 5. 역할 결정
      let role;
      if (user.customerProfile) {
        role = 'customer';
      } else if (user.ownerProfile) {
        role = 'owner';
      } else {
        role = 'unknown';
      }

      // 6. 검증된 사용자 정보 반환 (기존 DTO 형식 유지)
      return { 
        id: payload.sub, 
        email: payload.email,
        role,
        sessionId: payload.sessionId,
        isActive: user.isActive,
        ...(role === 'owner' && {
          ownerId: user.ownerProfile?.id
        })
      };
    } catch (error) {
      throw new UnauthorizedException('인증에 실패했습니다');
    }
  }
}