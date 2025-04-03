import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { StoreAmenity } from './store-amenity.entity';

@Entity('amenities')
export class Amenity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50 })
  name: string;

  @Column({ nullable: true })
  icon: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => StoreAmenity, storeAmenity => storeAmenity.amenity)
  storeAmenities: StoreAmenity[];
}