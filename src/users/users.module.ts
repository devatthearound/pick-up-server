import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { CustomerProfile } from './entities/customer-profile.entity';
import { OwnerProfile } from './entities/owner-profile.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User, CustomerProfile, OwnerProfile])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {} 