import { InjectRepository } from "@nestjs/typeorm";
import { UserSession } from "./entities/user-session.entity";
import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { Cron } from "@nestjs/schedule";
import { MoreThan } from "typeorm";

@Injectable()
export class SessionService {
  constructor(
    @InjectRepository(UserSession)
    private userSessionRepository: Repository<UserSession>,
  ) {}

  @Cron('0 */1 * * * *') // 매 1시간마다 실행
  async cleanupExpiredSessions() {
    const now = new Date();
    await this.userSessionRepository.createQueryBuilder()
      .delete()
      .where('expires_at < :now', { now })
      .orWhere('is_valid = :isValid', { isValid: false })
      .execute();
  }

  async trackSessionActivity(sessionId: number) {
    await this.userSessionRepository.update(
      sessionId,
      { lastActivityAt: new Date() }
    );
  }

  async getActiveSessions(userId: number): Promise<UserSession[]> {
    return this.userSessionRepository.find({
      where: {
        userId,
        isValid: true,
        expiresAt: MoreThan(new Date())
      }
    });
  }

  async invalidateAllUserSessions(userId: number) {
    await this.userSessionRepository.update(
      { userId, isValid: true },
      { 
        isValid: false,
        lastActivityAt: new Date()
      }
    );
  }
} 