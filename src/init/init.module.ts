import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InitController } from './init.controller';
import { InitService } from './init.service';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { CustomerProfile } from '../users/entities/customer-profile.entity';
import { OwnerProfile } from '../users/entities/owner-profile.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, CustomerProfile, OwnerProfile])],
  controllers: [InitController],
  providers: [InitService, UsersService],
  exports: [InitService],
})
export class InitModule {}
