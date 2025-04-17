import { Injectable, NotFoundException, BadRequestException, InternalServerErrorException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Connection, Between, MoreThanOrEqual, LessThanOrEqual, In, Not, Like } from 'typeorm';
import { Order, OrderStatus, PaymentStatus, PaymentMethod } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { OrderItemOption } from './entities/order-item-option.entity';
import { OrderStatusHistory } from './entities/order-status-history.entity';
import { OrderPayment } from './entities/order-payment.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { OptionItem } from '../menu/entities/option_items.entity';
import { CreateOrderDto, OrderItemDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { OrderQueryDto, SortBy, SortOrder } from './dto/order-query.dto';
import { Store } from '../store/entities/store.entity';
import { StoreOperationStatus } from '../store/entities/store-operation-status.entity';
import { CreatePaymentDto, UpdatePaymentStatusDto } from './dto/payment.dto';
import { NotificationService } from './notification.service';
import { KakaoTalkService } from '../notification/kakao-talk.service';
import { TEMPLATE_CODES } from 'src/notification/constants/kakao-talk.constants';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(OrderItemOption)
    private orderItemOptionRepository: Repository<OrderItemOption>,
    @InjectRepository(OrderStatusHistory)
    private orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    @InjectRepository(OrderPayment)
    private orderPaymentRepository: Repository<OrderPayment>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
    @InjectRepository(OptionItem)
    private optionItemRepository: Repository<OptionItem>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(StoreOperationStatus)
    private storeOperationStatusRepository: Repository<StoreOperationStatus>,
    private connection: Connection,
    private notificationService: NotificationService,
    private kakaoTalkService: KakaoTalkService
  ) {}

  async findAll(queryDto: OrderQueryDto) {
    const {
      page = 1,
      limit = 10,
      storeId,
      customerId,
      orderNumber,
      status,
      paymentStatus,
      pickupFrom,
      pickupTo,
      startDate,
      endDate,
      sortBy = SortBy.CREATED_AT,
      sortOrder = SortOrder.DESC,
      activeOnly,
    } = queryDto;

    const skip = (page - 1) * limit;

    // 쿼리 빌더 생성
    const queryBuilder = this.orderRepository.createQueryBuilder('order')
      .leftJoinAndSelect('order.orderItems', 'orderItems')
      .leftJoinAndSelect('orderItems.menuItem', 'menuItem')
      .leftJoinAndSelect('orderItems.options', 'options')
      .leftJoinAndSelect('options.optionItem', 'optionItem')
      .leftJoinAndSelect('order.customer', 'customer')
      .leftJoinAndSelect('order.store', 'store');

    // 필터 적용
    if (storeId) {
      queryBuilder.andWhere('order.storeId = :storeId', { storeId });
    }

    if (customerId) {
      queryBuilder.andWhere('order.customerId = :customerId', { customerId });
    }

    if (orderNumber) {
      queryBuilder.andWhere('order.orderNumber LIKE :orderNumber', { orderNumber: `%${orderNumber}%` });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (paymentStatus) {
      queryBuilder.andWhere('order.paymentStatus = :paymentStatus', { paymentStatus });
    }

    if (pickupFrom) {
      queryBuilder.andWhere('order.pickupTime >= :pickupFrom', { pickupFrom: new Date(pickupFrom) });
    }

    if (pickupTo) {
      queryBuilder.andWhere('order.pickupTime <= :pickupTo', { pickupTo: new Date(pickupTo) });
    }

    if (startDate) {
      const start = new Date(startDate);
      start.setHours(0, 0, 0, 0);
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate: start });
    }

    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate: end });
    }

    if (activeOnly) {
      queryBuilder.andWhere('order.status NOT IN (:...completedStatuses)', {
        completedStatuses: [OrderStatus.COMPLETED, OrderStatus.CANCELED, OrderStatus.REJECTED],
      });
    }

    // 정렬 적용
    switch (sortBy) {
      case SortBy.PICKUP_TIME:
        queryBuilder.orderBy('order.pickupTime', sortOrder);
        break;
      case SortBy.STATUS:
        queryBuilder.orderBy('order.status', sortOrder);
        break;
      case SortBy.CREATED_AT:
      default:
        queryBuilder.orderBy('order.createdAt', sortOrder);
        break;
    }

    // 2차 정렬
    queryBuilder.addOrderBy('order.id', sortOrder);

    // 페이지네이션 적용
    queryBuilder.skip(skip).take(limit);

    // 쿼리 실행
    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: [
        'orderItems',
        'orderItems.menuItem',
        'orderItems.options',
        'orderItems.options.optionItem',
        'customer',
        'store',
        'statusHistory',
      ],
    });

    if (!order) {
      throw new NotFoundException(`주문 ID ${id}를 찾을 수 없습니다.`);
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string) {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: [
        'orderItems',
        'orderItems.menuItem',
        'orderItems.options',
        'orderItems.options.optionItem',
        'customer',
        'store',
        'statusHistory',
      ],
    });

    if (!order) {
      throw new NotFoundException(`주문 번호 ${orderNumber}를 찾을 수 없습니다.`);
    }

    return order;
  }

  async findByPhone(phone: string) {
    const orders = await this.orderRepository.find({
      where: { customerPhone: phone },
      relations: [
        'orderItems',
        'orderItems.menuItem',
        'orderItems.options',
        'orderItems.options.optionItem',
        'store',
        'statusHistory',
      ],
      order: { createdAt: 'DESC' }
    });

    if (!orders || orders.length === 0) {
      throw new NotFoundException('해당 전화번호로 주문된 내역이 없습니다.');
    }

    return orders;
  }

  async findByOrderNumberAndPhone(orderNumber: string, phone: string) {
    const order = await this.orderRepository.findOne({
      where: { orderNumber, customerPhone: phone },
      relations: [
        'orderItems',
        'orderItems.menuItem',
        'orderItems.options',
        'orderItems.options.optionItem',
        'store',
        'statusHistory',
      ]
    });

    if (!order) {
      throw new NotFoundException('주문을 찾을 수 없습니다.');
    }

    return order;
  }

  async create(customerId: number | null, createOrderDto: CreateOrderDto) {
     // 매장 정보 조회
    const store = await this.storeRepository.findOne({
      where: { domain: createOrderDto.storeDomain },
      relations: ['owner', 'owner.user'],
    });

     
    if (!store) {
      throw new NotFoundException('매장을 찾을 수 없습니다.');
    }

    // 매장 운영 상태 확인
    const storeStatus = await this.storeOperationStatusRepository.findOne({
      where: { storeId: store.id },
    });

    if (!storeStatus || !storeStatus.isAcceptingOrders) {
      throw new BadRequestException('현재 매장에서 주문을 받지 않고 있습니다.');
    }


    // 주문 아이템 검증 및 가격 계산
    const validationResult = await this.validateOrderItems(createOrderDto.items);

    // 주문 번호 생성
    const orderNumber = this.generateOrderNumber();

    // 총 금액 계산
    const totalAmount = validationResult.totalAmount;
    const discountAmount = 0; // 할인 로직은 별도 구현 필요
    const finalAmount = totalAmount - discountAmount;

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. 주문 생성
      const order = queryRunner.manager.create(Order, {
        orderNumber,
        customerId: customerId || undefined,
        storeId: store.id,
        totalAmount,
        discountAmount,
        finalAmount,
        pickupTime: new Date(), // 현재 시간으로 설정
        customerNote: '',
        paymentMethod: createOrderDto.paymentMethod,
        status: OrderStatus.PENDING,
        paymentStatus: PaymentStatus.PENDING,
        isGuestOrder: !customerId,
        customerName: createOrderDto.guestInfo.name,
        customerPhone: createOrderDto.guestInfo.phone,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // 2. 주문 아이템 생성
      const orderItems = createOrderDto.items.map((item) => {
        const menuItem = validationResult.menuItems.find(
          (m) => m.id === item.menuItemId,
        );
        if (!menuItem) {
          throw new BadRequestException(
            `메뉴 아이템을 찾을 수 없습니다: ${item.menuItemId}`,
          );
        }

        return queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          menuItemId: item.menuItemId,
          quantity: item.quantity,
          unitPrice: menuItem.price,
          totalPrice: menuItem.price * item.quantity,
          specialInstructions: item.specialInstructions,
        });
      });

      const savedOrderItems = await queryRunner.manager.save(orderItems);

      // 3. 주문 아이템 옵션 생성
      const orderItemOptions = createOrderDto.items.flatMap((item, index) => {
        if (!item.options?.length) return [];

        return item.options.map((option) => {
          const optionItem = validationResult.optionItems.find(
            (o) => o.id === option.optionItemId,
          );
          if (!optionItem) {
            throw new BadRequestException(
              `옵션 아이템을 찾을 수 없습니다: ${option.optionItemId}`,
            );
          }

          return queryRunner.manager.create(OrderItemOption, {
            orderItemId: savedOrderItems[index].id,
            optionItemId: option.optionItemId,
            quantity: option.quantity || 1,
            price: optionItem.price,
          });
        });
      });

      if (orderItemOptions.length > 0) {
        await queryRunner.manager.save(orderItemOptions);
      }

      await queryRunner.commitTransaction();

      // 4. 알림 생성 및 발송
      // 고객에게 주문 접수 알림
      if (customerId) {
        await this.notificationService.createOrderNotification(
          savedOrder.id,
          customerId,
          'customer',
          'order_created',
          '주문이 접수되었습니다',
          `${store.name}에서 주문이 접수되었습니다. 주문번호: ${orderNumber}`,
        );
      }

      console.log('store.owner.user.id', store.owner.user.id);
      // 사장님에게 새 주문 알림
      await this.notificationService.createOrderNotification(
        savedOrder.id,
        store.owner.user.id,
        'owner',
        'new_order',
        '☎ 새로운 주문이 접수되었습니다.',
        `사장님 주문 수락하기를 눌러주세요.`,
      );

      return {
        orderId: savedOrder.id,
        orderNumber: savedOrder.orderNumber,
        totalAmount: savedOrder.totalAmount,
        finalAmount: savedOrder.finalAmount,
        status: savedOrder.status,
        paymentStatus: savedOrder.paymentStatus,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async updateStatus(id: number, updateOrderStatusDto: UpdateOrderStatusDto, userId?: number) {
    const order = await this.findOne(id);
    const previousStatus = order.status;

    // 상태 변경 가능 여부 검증
    this.validateStatusChange(previousStatus, updateOrderStatusDto.status);

    // 거부 사유 필수 체크
    if (updateOrderStatusDto.status === OrderStatus.REJECTED && !updateOrderStatusDto.rejectionReason) {
      throw new BadRequestException('주문 거부시 거부 사유를 입력해야 합니다.');
    }

    // 주문 상태 업데이트
    order.status = updateOrderStatusDto.status;
    if (updateOrderStatusDto.status === OrderStatus.REJECTED) {
      order.rejectionReason = updateOrderStatusDto.rejectionReason || '';
    }

    // 픽업 완료 시 실제 픽업 시간 기록
    if (updateOrderStatusDto.status === OrderStatus.COMPLETED && !order.actualPickupTime) {
      order.actualPickupTime = new Date();
    }

    const updatedOrder = await this.orderRepository.save(order);

    // 상태 이력 추가
    const statusHistory = this.orderStatusHistoryRepository.create({
      orderId: id,
      previousStatus: previousStatus,
      newStatus: updateOrderStatusDto.status,
      changedBy: userId || undefined,
      changedAt: new Date(),
      reason: updateOrderStatusDto.rejectionReason,
    } as OrderStatusHistory);

    await this.orderStatusHistoryRepository.save(statusHistory);

    // 알림 생성 및 발송
    await this.notificationService.createOrderStatusNotification(id, updateOrderStatusDto.status);

    // 카카오톡 알림 발송
    if (order.customerPhone) {
      const store = await this.storeRepository.findOne({
        where: { id: order.storeId },
      });

      const variables = {
        userPhone: order.customerPhone,
        userName: order.customerName || '고객',
        storeName: store?.name || '매장',
        orderNumber: order.orderNumber,
        status: this.getStatusText(updateOrderStatusDto.status),
        rejectionReason: updateOrderStatusDto.rejectionReason || '',
        orderName : order.orderItems[0].menuItem.name + '외 ' + (order.orderItems.length - 1) + '개',
        time : '10',
        link : `https://www.ezpickup.kr/u/order/${order.orderNumber}`,
      };

      if(updateOrderStatusDto.status === OrderStatus.PREPARING) {
        await this.kakaoTalkService.sendMessage(
          TEMPLATE_CODES.PREPARING,
          variables.userPhone,
          {
            storeName : variables.storeName,
            orderNumber : variables.orderNumber,
            orderName : variables.orderName,
            time : variables.time,
            link : variables.link,
          }
        );
      }else if(updateOrderStatusDto.status === OrderStatus.READY) {
        await this.kakaoTalkService.sendMessage(
          TEMPLATE_CODES.READY,
          variables.userPhone,
          {
            storeName : variables.storeName,
            orderNumber : variables.orderNumber,
            link : variables.link,
          }
        );
      }else if(updateOrderStatusDto.status === OrderStatus.COMPLETED) {
        await this.kakaoTalkService.sendMessage(
          TEMPLATE_CODES.PICKUP_COMPLETED,
          variables.userPhone,
          {
            storeName : variables.storeName,
            orderNumber : variables.orderNumber,
            link : variables.link,
          }
        );
      }else if(updateOrderStatusDto.status === OrderStatus.REJECTED) {
        await this.kakaoTalkService.sendMessage(
          TEMPLATE_CODES.ORDER_REJECTED,
          variables.userPhone,
          {
            storeName : variables.storeName,
            customerName : variables.userName,
            orderNumber : variables.orderNumber,
            reason : variables.rejectionReason,
            link : variables.link,
          }
        );
      }else{
        // 아무것도 없음
      }
    }

    return updatedOrder;
  }

  private getStatusText(status: OrderStatus): string {
    const statusTexts = {
      [OrderStatus.PENDING]: '접수 대기 중',
      // [OrderStatus.ACCEPTED]: '주문 접수됨',
      [OrderStatus.PREPARING]: '준비 중',
      [OrderStatus.READY]: '준비 완료',
      [OrderStatus.COMPLETED]: '픽업 완료',
      [OrderStatus.REJECTED]: '주문 거절',
      [OrderStatus.CANCELED]: '주문 취소',
    };
    return statusTexts[status] || status;
  }

  async cancelOrder(id: number, customerId: number, reason: string) {
    const order = await this.findOne(id);

    // 고객 소유 주문인지 확인
    if (order.customerId !== customerId) {
      throw new ForbiddenException('본인의 주문만 취소할 수 있습니다.');
    }

    // 취소 가능 상태인지 확인
    if (![OrderStatus.PENDING].includes(order.status)) {
      throw new BadRequestException('이미 처리 중인 주문은 취소할 수 없습니다.');
    }

    const updateDto: UpdateOrderStatusDto = {
      status: OrderStatus.CANCELED,
      rejectionReason: reason || '고객 요청으로 취소',
    };

    return this.updateStatus(id, updateDto, customerId);
  }

  async createPayment(createPaymentDto: CreatePaymentDto) {
    const order = await this.findOne(createPaymentDto.orderId);

    // 유효성 검사
    if (order.finalAmount !== createPaymentDto.amount) {
      throw new BadRequestException('결제 금액이 주문 금액과 일치하지 않습니다.');
    }

    // 기존 결제 정보 조회
    const existingPayment = await this.orderPaymentRepository.findOne({
      where: { orderId: order.id },
    });

    if (existingPayment) {
      // 기존 결제 정보 업데이트
      existingPayment.amount = createPaymentDto.amount;
      existingPayment.paymentMethod = createPaymentDto.paymentMethod;
      existingPayment.paymentStatus = PaymentStatus.COMPLETED;
      existingPayment.transactionId = createPaymentDto.transactionId || '';
      existingPayment.paymentDetails = createPaymentDto.paymentDetails || {};
      existingPayment.paidAt = new Date();

      await this.orderPaymentRepository.save(existingPayment);

      // 주문 상태 업데이트
      order.paymentStatus = PaymentStatus.COMPLETED;
      order.paymentMethod = createPaymentDto.paymentMethod;
      await this.orderRepository.save(order);

      return existingPayment;
    } else {
      // 새 결제 정보 생성
      const payment = this.orderPaymentRepository.create({
        orderId: order.id,
        amount: createPaymentDto.amount,
        paymentMethod: createPaymentDto.paymentMethod,
        paymentStatus: PaymentStatus.COMPLETED,
        transactionId: createPaymentDto.transactionId,
        paymentDetails: createPaymentDto.paymentDetails,
        paidAt: new Date(),
      });

      const savedPayment = await this.orderPaymentRepository.save(payment);

      // 주문 상태 업데이트
      order.paymentStatus = PaymentStatus.COMPLETED;
      order.paymentMethod = createPaymentDto.paymentMethod;
      await this.orderRepository.save(order);

      return savedPayment;
    }
  }

  async updatePaymentStatus(orderId: number, updatePaymentStatusDto: UpdatePaymentStatusDto) {
    const order = await this.findOne(orderId);
    const payment = await this.orderPaymentRepository.findOne({
      where: { orderId },
    });

    if (!payment) {
      throw new NotFoundException(`주문 ID ${orderId}의 결제 정보를 찾을 수 없습니다.`);
    }

    // 결제 정보 업데이트
    payment.paymentStatus = updatePaymentStatusDto.paymentStatus;
    if (updatePaymentStatusDto.transactionId) {
      payment.transactionId = updatePaymentStatusDto.transactionId;
    }
    if (updatePaymentStatusDto.paymentDetails) {
      payment.paymentDetails = updatePaymentStatusDto.paymentDetails;
    }

    // 결제 완료 시간 설정
    if (updatePaymentStatusDto.paymentStatus === PaymentStatus.COMPLETED && !payment.paidAt) {
      payment.paidAt = new Date();
    }

    // 환불 시간 설정
    if (updatePaymentStatusDto.paymentStatus === PaymentStatus.REFUNDED && !payment.refundedAt) {
      payment.refundedAt = new Date();
    }

    const updatedPayment = await this.orderPaymentRepository.save(payment);

    // 주문 결제 상태 업데이트
    order.paymentStatus = updatePaymentStatusDto.paymentStatus;
    await this.orderRepository.save(order);

    return updatedPayment;
  }

  // 주문 아이템 유효성 검사 및 총액 계산
  private async validateOrderItems(orderItems: OrderItemDto[]) {
    const menuItemIds = orderItems.map(item => item.menuItemId);
    
    // 메뉴 아이템 조회
    const menuItems = await this.menuItemRepository.find({
      where: { id: In(menuItemIds), isAvailable: true },
    });

    if (menuItems.length !== menuItemIds.length) {
      const availableIds = menuItems.map(item => item.id);
      const unavailableIds = menuItemIds.filter(id => !availableIds.includes(id));
      throw new BadRequestException(`다음 메뉴 아이템은 구매할 수 없습니다: ${unavailableIds.join(', ')}`);
    }

    // 옵션 아이템 IDs 수집
    const optionItemIds = orderItems
      .filter(item => item.options && item.options.length > 0)
      .flatMap(item => (item.options as { optionItemId: number }[]).map(option => option.optionItemId));

    let optionItems: OptionItem[] = [];
    if (optionItemIds.length > 0) {
      // 옵션 아이템 조회
      optionItems = await this.optionItemRepository.find({
        where: { id: In(optionItemIds), isAvailable: true },
      });

      if (optionItems.length !== optionItemIds.length) {
        const availableOptionIds = optionItems.map(item => item.id);
        const unavailableOptionIds = optionItemIds.filter(id => !availableOptionIds.includes(id));
        throw new BadRequestException(`다음 옵션은 구매할 수 없습니다: ${unavailableOptionIds.join(', ')}`);
      }
    }

    // 총액 계산
    let totalAmount = 0;

    for (const item of orderItems) {
      const menuItem = menuItems.find(mi => mi.id === item.menuItemId);
      if (!menuItem) {
        throw new BadRequestException(`메뉴 아이템 ID ${item.menuItemId}를 찾을 수 없습니다.`);
      }
      let itemTotal = (menuItem.discountedPrice || menuItem.price) * item.quantity;

      if (item.options && item.options.length > 0) {
        for (const option of item.options) {
          const optionItem = optionItems.find(oi => oi.id === option.optionItemId);
          if (!optionItem) {
            throw new BadRequestException(`옵션 아이템 ID ${option.optionItemId}를 찾을 수 없습니다.`);
          }
          itemTotal += optionItem.price * (option.quantity || 1);
        }
      }

      totalAmount += itemTotal;
    }

    return {
      totalAmount,
      menuItems,
      optionItems,
    };
  }

  // 주문 상태 변경 유효성 검사
  private validateStatusChange(currentStatus: OrderStatus, newStatus: OrderStatus) {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PREPARING, OrderStatus.REJECTED, OrderStatus.CANCELED],
      // [OrderStatus.ACCEPTED]: [OrderStatus.PREPARING, OrderStatus.CANCELED],
      [OrderStatus.PREPARING]: [OrderStatus.READY],
      [OrderStatus.READY]: [OrderStatus.COMPLETED],
      [OrderStatus.COMPLETED]: [],
      [OrderStatus.REJECTED]: [],
      [OrderStatus.CANCELED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(`현재 상태(${currentStatus})에서 ${newStatus}로 변경할 수 없습니다.`);
    }
  }

  // 주문 번호 생성
  private generateOrderNumber(): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `ORD-${dateStr}-${random}`;
  }
}