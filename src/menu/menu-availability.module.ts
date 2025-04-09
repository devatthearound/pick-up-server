import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuAvailabilityController } from './menu-availability.controller';
import { MenuAvailabilityService } from './menu-availability.service';
import { MenuAvailability } from './entities/menu-availability.entity';
import { MenuItem } from './entities/menu-item.entity';
import { Store } from '../store/entities/store.entity';
import { StoreModule } from '../store/store.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MenuAvailability, 
      MenuItem,
      Store
    ]),
    StoreModule,
  ],
  controllers: [MenuAvailabilityController],
  providers: [MenuAvailabilityService],
  exports: [MenuAvailabilityService],
})
export class MenuAvailabilityModule {}