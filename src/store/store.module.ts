import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { Store } from './entities/store.entity';
import { StoreCategory } from './entities/store-category.entity';
import { OwnerProfile } from '../users/entities/owner-profile.entity';
import { AuthModule } from '../auth/auth.module';
import { User } from '../users/entities/user.entity';
import { UserSession } from '../session/entities/user-session.entity';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { OperatingHoursController } from './operating-hour.controller';
import { OperatingHoursService } from './operating-hour.service';
import { SpecialDaysController } from './special-day.controller';
import { SpecialDaysService } from './special-day.service';
import { AmenityController } from './amenity.controller';
import { AmenityService } from './amenity.service';
import { StoreOperatingHour } from './entities/store-operating-hour.entity';
import { StoreSpecialDay } from './entities/store-special-day.entity';
import { Amenity } from './entities/amenity.entity';
import { StoreAmenity } from './entities/store-amenity.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Store, 
      StoreCategory, 
      OwnerProfile, 
      User, 
      UserSession, 
      StoreOperatingHour,
      StoreSpecialDay,
      Amenity,
      StoreAmenity
    ]),
    AuthModule,
  ],
  controllers: [
    StoreController, 
    CategoryController, 
    OperatingHoursController, 
    SpecialDaysController,
    AmenityController
  ],
  providers: [
    StoreService, 
    CategoryService, 
    OperatingHoursService, 
    SpecialDaysService,
    AmenityService
  ],
  exports: [StoreService],
})
export class StoreModule {}