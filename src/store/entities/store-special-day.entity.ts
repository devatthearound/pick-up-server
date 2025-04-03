import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './store.entity';

@Entity('store_special_days')
export class StoreSpecialDay {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'store_id' })
  storeId: number;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ type: 'date' })
  date: string; // 'YYYY-MM-DD' 형식

  @Column({ default: false, name: 'is_closed' })
  isClosed: boolean;

  @Column({ type: 'time', nullable: true, name: 'opening_time' })
  openingTime: string;

  @Column({ type: 'time', nullable: true, name: 'closing_time' })
  closingTime: string;

  @Column({ length: 100, nullable: true })
  reason: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}