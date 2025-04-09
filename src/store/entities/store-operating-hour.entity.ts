import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Store } from './store.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday',
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('store_operating_hours')
export class StoreOperatingHour {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'store_id' })
  storeId: number;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
    enumName: 'day_of_week',
    name: 'day_of_week',
  })
  dayOfWeek: DayOfWeek;

  @Column({ type: 'time', name: 'opening_time', nullable: true })
  openingTime: string | null;

  @Column({ type: 'time', name: 'closing_time', nullable: true })
  closingTime: string | null;

  @Column({ type: 'time', name: 'break_start_time', nullable: true })
  breakStartTime: string;

  @Column({ type: 'time', name: 'break_end_time', nullable: true })
  breakEndTime: string;

  @Column({ default: false, name: 'is_day_off' })
  isDayOff: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}