import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FirebaseMessagingService } from './firebase-messaging.service';
import { UserFcmToken } from './entities/user-fcm-token.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserFcmToken]),
  ],
  providers: [FirebaseMessagingService],
  exports: [FirebaseMessagingService],
})
export class FirebaseMessagingModule {} 