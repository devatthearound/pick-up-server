import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OptionController } from './option.controller';
import { OptionService } from './option.service';
import { OptionGroup } from './entities/option_groups.entity';
import { OptionItem } from './entities/option_items.entity';
import { MenuOptionGroup } from './entities/menu_option_groups.entity';
import { Store } from '../store/entities/store.entity';
import { MenuItem } from './entities/menu-item.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      OptionGroup, 
      OptionItem, 
      MenuOptionGroup, 
      Store, 
      MenuItem
    ]),
  ],
  controllers: [OptionController],
  providers: [OptionService],
  exports: [OptionService],
})
export class OptionModule {}