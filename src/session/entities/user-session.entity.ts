import { User } from '../../users/entities/user.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { DeviceInfo } from '../types/device-info.type';

@Entity('user_sessions')
export class UserSession {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ nullable: true })
  sessionToken: string;

  @Column({ length: 1024, nullable: true })
  refreshToken: string;

  @Column({ type: 'jsonb', nullable: true })
  deviceInfo: DeviceInfo;

  @Column({ length: 45 })
  ipAddress: string;

  @Column({ type: 'timestamp' })
  lastActivityAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ default: true })
  isValid: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @Column({ 
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP'
  })
  updatedAt: Date;

  // 세션 만료 여부 확인을 위한 메서드
  isExpired(): boolean {
    return this.expiresAt < new Date() || !this.isValid;
  }

  // 세션 활성화 상태 확인
  isActive(): boolean {
    return this.isValid && !this.isExpired();
  }

  // 세션 무효화
  invalidate(): void {
    this.isValid = false;
    this.lastActivityAt = new Date();
  }
} 