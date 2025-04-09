import { Column, JoinColumn, ManyToOne } from "typeorm";

import { Entity, PrimaryGeneratedColumn } from "typeorm";
import { MenuItem } from "./menu-item.entity";
import { OptionGroup } from "./option_groups.entity";

@Entity('menu_option_groups')
export class MenuOptionGroup {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'menu_id' })
  menuId: number;

  @Column({ name: 'option_group_id' })
  optionGroupId: number;

  @Column({ default: 0, name: 'display_order' })
  displayOrder: number;

  @ManyToOne(() => MenuItem, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'menu_id' })
  menuItem: MenuItem;

  @ManyToOne(() => OptionGroup, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'option_group_id' })
  optionGroup: OptionGroup;
}