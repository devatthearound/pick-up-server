import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, OneToMany, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Order } from './order.entity';
import { MenuItem } from '../../menu/entities/menu-item.entity';
import { OrderItemOption } from './order-item-option.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id' })
  orderId: number;

  @ManyToOne(() => Order, order => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ name: 'menu_item_id' })
  menuItemId: number;

  @ManyToOne(() => MenuItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'menu_item_id' })
  menuItem: MenuItem;

  @Column()
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'unit_price' })
  unitPrice: number;

  @Column('decimal', { precision: 10, scale: 2, name: 'total_price' })
  totalPrice: number;

  @Column({ type: 'text', nullable: true, name: 'special_instructions' })
  specialInstructions: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OrderItemOption, option => option.orderItem)
  options: OrderItemOption[];
}