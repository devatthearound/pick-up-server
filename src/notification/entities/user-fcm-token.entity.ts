import { Column, CreateDateColumn, JoinColumn, ManyToOne, UpdateDateColumn } from "typeorm";

import { PrimaryGeneratedColumn } from "typeorm";

import { Entity } from "typeorm";
import { User } from "../../users/entities/user.entity";

@Entity('user_fcm_tokens')
export class UserFcmToken {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'fcm_token' })
  fcmToken: string;

  @Column({ nullable: true, name: 'device_type' })
  deviceType: string;

  @Column({ nullable: true, name: 'device_id' })
  deviceId: string;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @ManyToOne(() => User, user => user.fcmTokens)
  @JoinColumn({ name: 'user_id' })
  user: User;
}