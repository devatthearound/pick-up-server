import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { CustomerProfile } from '../../users/entities/customer-profile.entity';
import { Store } from '../../store/entities/store.entity';
import { OrderItem } from './order-item.entity';
import { OrderStatusHistory } from './order-status-history.entity';
import { OrderPayment } from './order-payment.entity';
import { OrderNotification } from './order-notification.entity';

export enum OrderStatus {
  PENDING = 'pending',
  ACCEPTED = 'accepted',
  REJECTED = 'rejected',
  PREPARING = 'preparing',
  READY = 'ready',
  COMPLETED = 'completed',
  CANCELED = 'canceled'
}

export enum PaymentStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded'
}

export enum PaymentMethod {
  CREDIT_CARD = 'credit_card',
  BANK_TRANSFER = 'bank_transfer',
  MOBILE_PAYMENT = 'mobile_payment',
  POINT = 'point',
  CASH = 'cash',
  OTHER = 'other'
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, name: 'order_number' })
  orderNumber: string;

  @Column({ nullable: true, name: 'customer_id' })
  customerId?: number;

  @Column({ nullable: true, name: 'customer_name' })
  customerName?: string;

  @Column({ nullable: true, name: 'customer_phone' })
  customerPhone?: string;

  @Column({ default: false, name: 'is_guest_order' })
  isGuestOrder: boolean;

  @ManyToOne(() => CustomerProfile, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerProfile;

  @Column({ name: 'store_id' })
  storeId: number;

  @ManyToOne(() => Store, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    default: OrderStatus.PENDING
  })
  status: OrderStatus;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_amount' })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'discount_amount', default: 0 })
  discountAmount: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'final_amount' })
  finalAmount: number;

  @Column({
    type: 'enum',
    enum: PaymentStatus,
    default: PaymentStatus.PENDING,
    name: 'payment_status'
  })
  paymentStatus: PaymentStatus;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
    nullable: true,
    name: 'payment_method'
  })
  paymentMethod: PaymentMethod;

  @Column({ type: 'timestamp', name: 'pickup_time' })
  pickupTime: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'actual_pickup_time' })
  actualPickupTime: Date;

  @Column({ type: 'text', nullable: true, name: 'customer_note' })
  customerNote: string;

  @Column({ type: 'text', nullable: true, name: 'rejection_reason' })
  rejectionReason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderItem, orderItem => orderItem.order)
  orderItems: OrderItem[];

  @OneToMany(() => OrderStatusHistory, history => history.order)
  statusHistory: OrderStatusHistory[];

  @OneToMany(() => OrderNotification, notification => notification.order)
  notifications: OrderNotification[];
}