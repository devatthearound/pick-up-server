// src/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          return request?.cookies?.access_token;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get('jwt.secret'),
    });
  }

  async validate(payload: any) {
    try {
      // 사용자 조회 및 역할 정보 포함
      const user = await this.usersRepository.findOne({ 
        where: { id: payload.sub },
        relations: ['customerProfile', 'ownerProfile'],
      });

      if (!user) {
        throw new UnauthorizedException();
      }

      // 사용자 역할 결정
      let role;
      if (user.customerProfile) {
        role = 'customer';
      } else if (user.ownerProfile) {
        role = 'owner';
      } else {
        role = 'unknown';
      }

      // JWT 페이로드에 역할 정보를 추가하고 반환
      return { 
        id: payload.sub, 
        email: payload.email,
        role,
        sessionId: payload.sessionId,
      };
    } catch (error) {
      throw new UnauthorizedException();
    }
  }
}