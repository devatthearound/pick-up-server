import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, JoinColumn, OneToMany } from 'typeorm';
import { Store } from '../../store/entities/store.entity';
import { MenuCategory } from './menu-category.entity';
import { MenuItemCategory } from './menu-item-category.entity';

@Entity('menu_items')
export class MenuItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'store_id' })
  storeId: number;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @OneToMany(() => MenuItemCategory, menuItemCategory => menuItemCategory.menuItem)
  menuItemCategories: MenuItemCategory[];

  @Column({ length: 100 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true, name: 'discounted_price' })
  discountedPrice: number;

  @Column({ nullable: true, name: 'image_url' })
  imageUrl: string;

  @Column({ nullable: true, name: 'preparation_time', type: 'int' })
  preparationTime: number;

  @Column({ default: true, name: 'is_available' })
  isAvailable: boolean;

  @Column({ default: false, name: 'is_popular' })
  isPopular: boolean;

  @Column({ default: false, name: 'is_new' })
  isNew: boolean;

  @Column({ default: false, name: 'is_recommended' })
  isRecommended: boolean;

  @Column({ nullable: true, name: 'stock_quantity', type: 'int' })
  stockQuantity: number;

  @Column({ default: false, name: 'is_deleted' })
  isDeleted: boolean;

  @Column({ nullable: true, name: 'deleted_at' })
  deletedAt: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}