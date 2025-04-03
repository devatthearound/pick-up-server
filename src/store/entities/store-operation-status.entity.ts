import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './store.entity';

export enum PauseType {
  TEMPORARY = 'temporary',
  TODAY = 'today',
  INDEFINITE = 'indefinite',
}

@Entity('store_operation_status')
export class StoreOperationStatus {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'store_id' })
  storeId: number;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ default: true, name: 'is_accepting_orders' })
  isAcceptingOrders: boolean;

  @Column({ type: 'timestamp', nullable: true, name: 'pause_until' })
  pauseUntil: Date | null;

  @Column({ nullable: true, name: 'pause_reason', length: 255 })
  pauseReason: string;

  @Column({ 
    nullable: true, 
    name: 'pause_type',
    type: 'enum',
    enum: PauseType,
  })
  pauseType: PauseType | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}