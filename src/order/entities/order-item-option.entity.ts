import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';
import { OptionItem } from '../../menu/entities/option_items.entity';

@Entity('order_item_options')
export class OrderItemOption {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_item_id' })
  orderItemId: number;

  @ManyToOne(() => OrderItem, orderItem => orderItem.options, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_item_id' })
  orderItem: OrderItem;

  @Column({ name: 'option_item_id' })
  optionItemId: number;

  @ManyToOne(() => OptionItem, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'option_item_id' })
  optionItem: OptionItem;

  @Column({ default: 1 })
  quantity: number;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}