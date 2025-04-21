// src/auth/guards/jwt-auth.guard.ts
import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { SessionService } from '../../session/session.service';
import { Inject, Optional } from '@nestjs/common';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(
    @Optional() @Inject(SessionService)
    private sessionService?: SessionService,
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
    if (user.sessionId && this.sessionService) {
      this.updateSessionActivity(user.sessionId);
    }
    
    return user;
  }

  private async updateSessionActivity(sessionId: number) {
    try {
      if (this.sessionService) {
        await this.sessionService.trackSessionActivity(sessionId);
      }
    } catch (error) {
      // 세션 업데이트 실패 시 로그만 남기고 인증 프로세스는 계속 진행
      console.error('세션 활동 시간 업데이트 실패:', error);
    }
  }
}