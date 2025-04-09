import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuCategoryController } from './menu-category.controller';
import { MenuItemController } from './menu-item.controller';
import { MenuCategoryService } from './menu-category.service';
import { MenuItemService } from './menu-item.service';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItem } from './entities/menu-item.entity';
import { Store } from '../store/entities/store.entity';
import { UserSession } from '../session/entities/user-session.entity';
import { StoreModule } from 'src/store/store.module';
import { S3Service } from '../common/services/s3.service';
@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuCategory, 
      MenuItem, 
      Store, 
      UserSession
    ]),
    StoreModule
  ],
  controllers: [MenuCategoryController, MenuItemController],
  providers: [MenuCategoryService, MenuItemService, S3Service],
  exports: [MenuCategoryService, MenuItemService],
})
export class MenuModule {}
