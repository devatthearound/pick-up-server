import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToOne, OneToMany } from 'typeorm';
import { CustomerProfile } from './customer-profile.entity';
import { OwnerProfile } from './owner-profile.entity';
import { UserSession } from '../../session/entities/user-session.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  phone: string;

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
}