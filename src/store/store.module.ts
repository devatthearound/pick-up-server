import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreService } from './store.service';
import { StoreController } from './store.controller';
import { Store } from './entities/store.entity';
import { StoreCategory } from './entities/store-category.entity';
import { OwnerProfile } from '../users/entities/owner-profile.entity';
import { AuthModule } from '../auth/auth.module';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
@Module({
  imports: [
    TypeOrmModule.forFeature([Store, StoreCategory, OwnerProfile]),
    AuthModule,
  ],
  controllers: [StoreController],
  providers: [StoreService, JwtAuthGuard],
  exports: [StoreService],
})
export class StoreModule {}
