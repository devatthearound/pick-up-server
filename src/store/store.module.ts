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
import { MulterModule } from '@nestjs/platform-express';
import { S3Service } from '../common/services/s3.service';
import { diskStorage } from 'multer';
import * as path from 'path';
import * as fs from 'fs';

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
    MulterModule.register({
      storage: diskStorage({
        destination: (req, file, cb) => {
          const uploadDir = './uploads/temp';
          // 임시 디렉토리가 없으면 생성
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          cb(null, uploadDir);
        },
        filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
      }),
      limits: {
        fileSize: 5 * 1024 * 1024, // 5MB
      },
    }),
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
    AmenityService,
    S3Service
  ],
  exports: [StoreService],
})
export class StoreModule {}