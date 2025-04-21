import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSession } from '../../session/entities/user-session.entity';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @InjectRepository(UserSession)
    private sessionRepository: Repository<UserSession>,
  ) {
    super();
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    return super.canActivate(context);
  }

  handleRequest(err, user, info) {
    if (err || !user) {
      throw err || new UnauthorizedException('인증이 필요합니다');
    }
    
    // 세션 활동 시간 업데이트 추가 작업
    if (user.sessionId) {
      this.updateSessionActivity(user.sessionId);
    }
    
    return user;
  }

  private async updateSessionActivity(sessionId: number) {
    try {
      await this.sessionRepository.update(
        sessionId,
        { lastActivityAt: new Date() }
      );
    } catch (error) {
      // 세션 업데이트 실패 시 로그만 남기고 인증 프로세스는 계속 진행
      console.error('세션 활동 시간 업데이트 실패:', error);
    }
  }
}


