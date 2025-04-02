import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './entities/user-session.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession]),
  ],
  exports: [TypeOrmModule],
})
export class SessionModule {} 