import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Store } from '../../store/entities/store.entity';
import { OptionItem } from './option_items.entity';

@Entity('option_groups')
export class OptionGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'store_id' })
  storeId: number;

  @ManyToOne(() => Store, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'store_id' })
  store: Store;

  @Column({ length: 50 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ default: false, name: 'is_required' })
  isRequired: boolean;

  @Column({ default: 0, name: 'min_selections' })
  minSelections: number;

  @Column({ default: 1, name: 'max_selections' })
  maxSelections: number;

  @Column({ default: 0, name: 'display_order' })
  displayOrder: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => OptionItem, optionItem => optionItem.group)
  optionItems: OptionItem[];
}

