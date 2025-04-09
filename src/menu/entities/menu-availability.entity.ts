import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { MenuItem } from './menu-item.entity';

export enum DayOfWeek {
  MONDAY = 'monday',
  TUESDAY = 'tuesday', 
  WEDNESDAY = 'wednesday',
  THURSDAY = 'thursday',
  FRIDAY = 'friday',
  SATURDAY = 'saturday',
  SUNDAY = 'sunday',
}

@Entity('menu_availability')
export class MenuAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'menu_id' })
  menuId: number;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menuItem: MenuItem;

  @Column({
    type: 'enum',
    enum: DayOfWeek,
    enumName: 'day_of_week',
    name: 'day_of_week',
    nullable: true
  })
  dayOfWeek: DayOfWeek | null;

  @Column({ type: 'time', name: 'start_time', nullable: true })
  startTime: string | null;

  @Column({ type: 'time', name: 'end_time', nullable: true })
  endTime: string | null;

  @Column({ default: true, name: 'is_available' })
  isAvailable: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}