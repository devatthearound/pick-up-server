import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { OwnerProfile } from '../../users/entities/owner-profile.entity';
import { StoreAmenity } from './store-amenity.entity';

@Entity('stores')
export class Store {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'owner_id', nullable: false })
  ownerId: number;

  @ManyToOne(() => OwnerProfile, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'owner_id' })
  owner: OwnerProfile;

  @Column({ length: 100 })
  name: string;

  @Column({ length: 100, unique: true })
  domain: string;

  @Column({ length: 100, nullable: true, name: 'english_name' })
  englishName: string;

  @Column({ length: 20, unique: true, name: 'business_registration_number' })
  businessRegistrationNumber: string;

  @Column({ length: 255, nullable: true, name: 'business_registration_file' })
  businessRegistrationFile: string;

  @Column({ name: 'category_id' })
  categoryId: number;

  @Column({ length: 255 })
  address: string;

  @Column({ length: 100, name: 'address_detail' })
  addressDetail: string;

  @Column({ length: 20 })
  phone: string;

  @Column({ length: 255, nullable: true, name: 'business_hours' })
  businessHours: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ length: 255, nullable: true, name: 'logo_image' })
  logoImage: string;

  @Column({ length: 255, nullable: true, name: 'banner_image' })
  bannerImage: string;

  @Column({ default: false, name: 'is_verified' })
  isVerified: boolean;

  @Column({ default: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
  
  @OneToMany(() => StoreAmenity, storeAmenity => storeAmenity.store)
  storeAmenities: StoreAmenity[];
}