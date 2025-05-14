import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderController } from './order.controller';
import { OrderService } from './order.service';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemOption } from './entities/order-item-option.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderPayment } from './entities/order-payment.entity';
import { OrderNotification } from './entities/order-notification.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { OptionItem } from '../menu/entities/option_items.entity';
import { Store } from '../store/entities/store.entity';
import { StoreOperationStatus } from '../store/entities/store-operation-status.entity';
import { FirebaseMessagingModule } from '../notification/firebase-messaging.module';
import { KakaoTalkService } from '../notification/kakao-talk.service';
import { CustomerProfile } from '../users/entities/customer-profile.entity';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      OrderItem,
      OrderItemOption,
      OrderStatusHistory,
      OrderPayment,
      OrderNotification,
      MenuItem,
      OptionItem,
      Store,
      StoreOperationStatus,
      CustomerProfile,
    ]),
    FirebaseMessagingModule,
  ],
  controllers: [OrderController, NotificationController],
  providers: [OrderService, NotificationService, KakaoTalkService],
  exports: [OrderService, NotificationService],
})
export class OrderModule {}