import { Injectable } from '@nestjs/common';
import { initializeFirebase } from '../config/firebase.config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { UserFcmToken } from './entities/user-fcm-token.entity';
import { messaging } from 'firebase-admin';

@Injectable()
export class FirebaseMessagingService {
  private readonly messaging: messaging.Messaging;

  constructor(
    @InjectRepository(UserFcmToken)
    private readonly userFcmTokenRepository: Repository<UserFcmToken>,
  ) {
    const { messaging } = initializeFirebase();
    this.messaging = messaging;
  }

  async getTokens(userId: number) {
    return this.userFcmTokenRepository.find({
      where: { userId, isActive: true },
    });
  }

  // 모든 값을 문자열로 변환하는 유틸리티 함수
  private convertToStringValues(data: Record<string, any>): Record<string, string> {
    const result: Record<string, string> = {};
    for (const [key, value] of Object.entries(data)) {
      result[key] = String(value);
    }
    return result;
  }

  async sendNotification(
    userId: number,
    title: string,
    body: string,
    data?: Record<string, any>,
  ): Promise<void> {
    const tokens = await this.userFcmTokenRepository.find({
      where: { userId, isActive: true },
    });

    if (tokens.length === 0) {
      return;
    }

    const message: messaging.Message = {
      token: tokens[0].fcmToken,
      notification: {
        title,
        body,
      },
      data: data ? this.convertToStringValues(data) : undefined,
      android: {
        notification: {
          sound: 'custom_sound',
          channelId: 'default',
        },
      },
    };

    try {
      await this.messaging.send(message);
    } catch (error) {
      console.error('Failed to send notification:', error);
      throw error;
    }
  }

  async registerToken(
    userId: number,
    fcmToken: string,
    deviceType: string,
    deviceId: string,
  ): Promise<void> {
    // 기존 토큰 비활성화
    await this.userFcmTokenRepository.update(
      { userId, deviceId },
      { isActive: false },
    );

    // 새 토큰 등록
    const token = this.userFcmTokenRepository.create({
      userId,
      fcmToken,
      deviceType,
      deviceId,
      isActive: true,
    });

    await this.userFcmTokenRepository.save(token);
  }

  async unregisterToken(userId: number, deviceId: string): Promise<void> {
    await this.userFcmTokenRepository.update(
      { userId, deviceId },
      { isActive: false },
    );
  }
} 