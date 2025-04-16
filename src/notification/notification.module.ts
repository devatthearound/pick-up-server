import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { UserFcmToken } from './entities/user-fcm-token.entity';
import { FirebaseMessagingModule } from './firebase-messaging.module';
import { KakaoTalkService } from './kakao-talk.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserFcmToken]),
    FirebaseMessagingModule,
  ],
  controllers: [NotificationController],
  providers: [KakaoTalkService],
  exports: [KakaoTalkService],
})
export class NotificationModule {} 