import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderNotification } from './entities/order-notification.entity';
import { OrderStatus } from './entities/order.entity';
import { RecipientType } from './entities/order-notification.entity';
import { NotificationQueryDto, UpdateNotificationDto, CreateNotificationDto } from './dto/notification.dto';
import { Order } from './entities/order.entity';
import { FirebaseMessagingService } from '../notification/firebase-messaging.service';

interface NotificationData {
  orderId: number;
  recipientId: number;
  recipientType: RecipientType;
  type: string;
  title: string;
  message: string;
}

@Injectable()
export class NotificationService {
  constructor(
    @InjectRepository(OrderNotification)
    private notificationRepository: Repository<OrderNotification>,
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    private firebaseMessagingService: FirebaseMessagingService,
  ) {}

  async findAllByRecipient(recipientId: number, recipientType: RecipientType, queryDto: NotificationQueryDto) {
    const { isRead, page = 1, limit = 20 } = queryDto;
    const skip = (page - 1) * limit;

    const queryBuilder = this.notificationRepository.createQueryBuilder('notification')
      .where('notification.recipientId = :recipientId', { recipientId })
      .andWhere('notification.recipientType = :recipientType', { recipientType })
      .leftJoinAndSelect('notification.order', 'order');

    if (isRead !== undefined) {
      queryBuilder.andWhere('notification.isRead = :isRead', { isRead });
    }

    queryBuilder.orderBy('notification.sentAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [notifications, total] = await queryBuilder.getManyAndCount();

    return {
      data: notifications,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    return this.notificationRepository.findOne({
      where: { id },
      relations: ['order'],
    });
  }

  async create(createNotificationDto: CreateNotificationDto) {
    const notification = this.notificationRepository.create(createNotificationDto);
    return this.notificationRepository.save(notification);
  }

  async update(id: number, updateNotificationDto: UpdateNotificationDto) {
    const notification = await this.findOne(id);

    if (!notification) {
      throw new NotFoundException('알림을 찾을 수 없습니다.');
    }
    
    // 읽음 상태로 변경할 때 읽은 시간 설정
    if (updateNotificationDto.isRead && !notification.isRead) {
      notification.readAt = new Date();
    }
    
    notification.isRead = updateNotificationDto.isRead;
    
    return this.notificationRepository.save(notification);
  }

  async sendPushNotification(recipientId: number, title: string, message: string, data?: any) {
    try {
      return await this.firebaseMessagingService.sendNotification(
        recipientId,
        title,
        message,
        data,
      );
    } catch (error) {
      console.error('Error in sendPushNotification:', error);
      throw error;
    }
  }

  async createOrderNotification(
    orderId: number,
    recipientId: number,
    recipientType: string,
    type: string,
    title: string,
    message: string
  ) {
    const notification = this.notificationRepository.create({
      orderId,
      recipientId,
      recipientType: recipientType as RecipientType,
      type,
      title,
      message,
      isRead: false,
      sentAt: new Date(),
    });

    const savedNotification = await this.notificationRepository.save(notification);

    try{
      // 푸시 알림 전송
      await this.sendPushNotification(recipientId, title, message, {
        notificationId: savedNotification.id,
        orderId,
        type,
      });
    } catch (error) {
      console.error('Error in createOrderNotification:', error);
    }

    return savedNotification;
  }

  async createOrderStatusNotification(orderId: number, status: OrderStatus) {
    const order = await this.orderRepository.findOne({
      where: { id: orderId },
      relations: ['customer', 'store'],
    });

    if (!order) {
      return;
    }

    const notifications: NotificationData[] = [];

    // 비회원 주문인 경우 알림을 생성하지 않음
    if (order.isGuestOrder) {
      return;
    }

    // 상태별 알림 내용 설정
    switch (status) {
      // case OrderStatus.ACCEPTED:
      //   // 고객에게 주문 수락 알림
      //   notifications.push({
      //     orderId,
      //     recipientId: order.customerId || 0,
      //     recipientType: RecipientType.CUSTOMER,
      //     type: 'order_accepted',
      //     title: '주문이 수락되었습니다',
      //     message: '회원님의 주문이 가게에서 수락되었습니다. 조리가 시작됩니다.',
      //   });
      //   break;

      case OrderStatus.REJECTED:
        // 고객에게 주문 거부 알림
        notifications.push({
          orderId,
          recipientId: order.customerId || 0,
          recipientType: RecipientType.CUSTOMER,
          type: 'order_rejected',
          title: '주문이 거부되었습니다',
          message: `죄송합니다. 회원님의 주문이 가게 사정으로 인해 거부되었습니다. 사유: ${order.rejectionReason || '가게 사정'}`,
        });
        break;

      case OrderStatus.PREPARING:
        // 고객에게 조리 시작 알림
        notifications.push({
          orderId,
          recipientId: order.customerId || 0,
          recipientType: RecipientType.CUSTOMER,
          type: 'order_preparing',
          title: '주문하신 음식 조리가 시작되었습니다',
          message: '회원님이 주문하신 음식이 현재 조리 중입니다.',
        });
        break;

      case OrderStatus.READY:
        // 고객에게 픽업 준비 완료 알림
        notifications.push({
          orderId,
          recipientId: order.customerId || 0,
          recipientType: RecipientType.CUSTOMER,
          type: 'pickup_ready',
          title: '음식 준비가 완료되었습니다',
          message: '주문하신 음식이 준비되었습니다. 픽업 가능합니다.',
        });
        break;

      case OrderStatus.COMPLETED:
        // 양측에 주문 완료 알림
        notifications.push({
          orderId,
          recipientId: order.customerId || 0,
          recipientType: RecipientType.CUSTOMER,
          type: 'order_completed',
          title: '주문이 완료되었습니다',
          message: '주문이 성공적으로 완료되었습니다. 이용해 주셔서 감사합니다.',
        });
        
        notifications.push({
          orderId,
          recipientId: order.store.ownerId,
          recipientType: RecipientType.OWNER,
          type: 'order_completed',
          title: '주문이 완료되었습니다',
          message: `주문번호 ${order.orderNumber}이 성공적으로 완료되었습니다.`,
        });
        break;

      case OrderStatus.CANCELED:
        // 양측에 주문 취소 알림
        notifications.push({
          orderId,
          recipientId: order.customerId || 0,
          recipientType: RecipientType.CUSTOMER,
          type: 'order_canceled',
          title: '주문이 취소되었습니다',
          message: '회원님의 주문이 취소되었습니다.',
        });
        
        notifications.push({
          orderId,
          recipientId: order.store.ownerId,
          recipientType: RecipientType.OWNER,
          type: 'order_canceled',
          title: '주문이 취소되었습니다',
          message: `주문번호 ${order.orderNumber}이 취소되었습니다.`,
        });
        break;

      default:
        break;
    }

    // 알림 생성 및 푸시 알림 전송
    for (const notificationData of notifications) {
      const notification = this.notificationRepository.create({
        ...notificationData,
        isRead: false,
        sentAt: new Date(),
      });
      const savedNotification = await this.notificationRepository.save(notification);

      // 푸시 알림 전송
      await this.sendPushNotification(
        notificationData.recipientId,
        notificationData.title,
        notificationData.message,
        {
          notificationId: savedNotification.id,
          orderId,
          type: notificationData.type,
        },
      );
    }

    return notifications.length;
  }

  async markAllAsRead(recipientId: number, recipientType: RecipientType) {
    const now = new Date();
    
    await this.notificationRepository.update(
      { recipientId, recipientType, isRead: false },
      { isRead: true, readAt: now }
    );
    
    return { success: true, message: '모든 알림이 읽음 처리되었습니다.' };
  }

  async countUnread(recipientId: number, recipientType: RecipientType) {
    const count = await this.notificationRepository.count({
      where: { recipientId, recipientType, isRead: false },
    });
    
    return { count };
  }
}