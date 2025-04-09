import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from './order.entity';

export enum RecipientType {
  CUSTOMER = 'customer',
  OWNER = 'owner'
}

@Entity('order_notifications')
export class OrderNotification {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Order, order => order.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'recipient_id' })
  recipientId: number;

  @Column({
    name: 'recipient_type',
    type: 'varchar',
    length: 20
  })
  recipientType: RecipientType;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 100 })
  title: string;

  @Column('text')
  message: string;

  @Column({ default: false, name: 'is_read' })
  isRead: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'sent_at' })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'read_at' })
  readAt: Date;
}