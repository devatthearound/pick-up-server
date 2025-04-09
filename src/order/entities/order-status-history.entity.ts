import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Order, OrderStatus } from './order.entity';

@Entity('order_status_history')
export class OrderStatusHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Order, order => order.statusHistory, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    nullable: true,
    name: 'previous_status',
    enumName: 'order_status'
  })
  previousStatus: OrderStatus;

  @Column({
    type: 'enum',
    enum: OrderStatus,
    name: 'new_status',
    enumName: 'order_status'
  })
  newStatus: OrderStatus;

  @Column({ nullable: true, name: 'changed_by' })
  changedBy: number;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', name: 'changed_at' })
  changedAt: Date;

  @Column({ type: 'text', nullable: true })
  reason: string;
}