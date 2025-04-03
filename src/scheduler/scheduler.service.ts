import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { OperationStatusService } from '../store/operation-status.service';

@Injectable()
export class SchedulerService {
  private readonly logger = new Logger(SchedulerService.name);

  constructor(
    private readonly operationStatusService: OperationStatusService,
  ) {}

  // 매 5분마다 매장 운영 상태 자동 체크
  @Cron(CronExpression.EVERY_5_MINUTES)
  async handleAutoPauseStatusCheck() {
    this.logger.debug('Running auto check for store operation status');
    try {
      await this.operationStatusService.autoCheckPauseStatus();
    } catch (error) {
      this.logger.error('Error during auto pause status check', error.stack);
    }
  }
}