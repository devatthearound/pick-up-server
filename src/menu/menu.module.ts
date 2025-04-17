import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuItemController } from './menu-item.controller';
import { MenuItemService } from './menu-item.service';
import { MenuItem } from './entities/menu-item.entity';
import { MenuCategoryController } from './menu-category.controller';
import { MenuCategoryService } from './menu-category.service';
import { MenuCategory } from './entities/menu-category.entity';
import { Store } from '../store/entities/store.entity';
import { MenuItemCategory } from './entities/menu-item-category.entity';
import { MenuItemCategoryController } from './menu-item-category.controller';
import { MenuItemCategoryService } from './menu-item-category.service';
import { StoreModule } from 'src/store/store.module';
import { S3Service } from '../common/services/s3.service';
import { UserSession } from 'src/session/entities/user-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuItem,
      MenuCategory,
      Store,
      UserSession,
      MenuItemCategory,
    ]),
    StoreModule
  ],
  controllers: [
    MenuItemController,
    MenuCategoryController,
    MenuItemCategoryController,
  ],
  providers: [
    MenuItemService,
    MenuCategoryService,
    MenuItemCategoryService,
    S3Service
  ],
  exports: [
    MenuItemService,
    MenuCategoryService,
    MenuItemCategoryService,
  ],
})
export class MenuModule {}
