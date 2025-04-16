import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { OrderNotification } from './entities/order-notification.entity';
import { Order } from './entities/order.entity';
import { FirebaseMessagingModule } from '../notification/firebase-messaging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([OrderNotification, Order]),
    FirebaseMessagingModule,
  ],
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {} 