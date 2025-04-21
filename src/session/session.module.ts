import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserSession } from './entities/user-session.entity';
import { SessionService } from './session.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserSession]),
  ],
  providers: [SessionService],
  exports: [TypeOrmModule, SessionService],
})
export class SessionModule {}