import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany } from 'typeorm';
import { CustomerProfile } from './customer-profile.entity';
import { OwnerProfile } from './owner-profile.entity';
import { UserSession } from '../../session/entities/user-session.entity';
import { UserFcmToken } from '../../notification/entities/user-fcm-token.entity';
@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, type: 'varchar' })
  email: string | null;

  @Column()
  password: string;

  @Column({ nullable: true, type: 'varchar' })
  phone: string | null;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @Column({ nullable: true, name: 'last_login_at' })
  lastLoginAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;

  @OneToOne(() => CustomerProfile, (profile) => profile.user)
  customerProfile: CustomerProfile;

  @OneToOne(() => OwnerProfile, (profile) => profile.user)
  ownerProfile: OwnerProfile;

  @OneToMany(() => UserSession, (session) => session.user)
  sessions: UserSession[];

  @OneToMany(() => UserFcmToken, (token) => token.user)
  fcmTokens: UserFcmToken[];
}