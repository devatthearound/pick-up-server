import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './store.entity';
import { PauseType } from './store-operation-status.entity';

@Entity('store_pause_history')
export class StorePauseHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'store_id' })
  storeId: number;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ name: 'paused_at', type: 'timestamp' })
  pausedAt: Date;

  @Column({ name: 'resumed_at', type: 'timestamp', nullable: true })
  resumedAt: Date;

  @Column({ type: 'interval', nullable: true })
  duration: string;

  @Column({ nullable: true, name: 'pause_reason', length: 255 })
  pauseReason: string;

  @Column({ 
    nullable: true, 
    name: 'pause_type',
    type: 'enum',
    enum: PauseType,
  })
  pauseType: PauseType | null;
}