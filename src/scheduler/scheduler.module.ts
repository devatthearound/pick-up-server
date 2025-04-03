import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { SchedulerService } from './scheduler.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StoreOperationStatus } from '../store/entities/store-operation-status.entity';
import { StorePauseHistory } from '../store/entities/store-pause-history.entity';
import { Store } from '../store/entities/store.entity';
import { OperationStatusService } from '../store/operation-status.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([StoreOperationStatus, StorePauseHistory, Store]),
  ],
  providers: [SchedulerService, OperationStatusService],
})
export class SchedulerModule {}