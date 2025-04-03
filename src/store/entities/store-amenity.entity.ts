import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { Store } from './store.entity';
import { Amenity } from './amenity.entity';

@Entity('store_amenities')
export class StoreAmenity {
  @PrimaryColumn({ name: 'store_id' })
  storeId: number;

  @PrimaryColumn({ name: 'amenity_id' })
  amenityId: number;

  @ManyToOne(() => Store, store => store.storeAmenities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @ManyToOne(() => Amenity, amenity => amenity.storeAmenities, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'amenity_id' })
  amenity: Amenity;
}