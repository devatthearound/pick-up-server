import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual, IsNull } from 'typeorm';
import { StoreOperationStatus, PauseType } from './entities/store-operation-status.entity';
import { StorePauseHistory } from './entities/store-pause-history.entity';
import { Store } from './entities/store.entity';
import { PauseOrdersDto, PauseHistoryQueryDto } from './dto/operation-status.dto';

@Injectable()
export class OperationStatusService {
  constructor(
    @InjectRepository(StoreOperationStatus)
    private operationStatusRepository: Repository<StoreOperationStatus>,
    @InjectRepository(StorePauseHistory)
    private pauseHistoryRepository: Repository<StorePauseHistory>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  // 매장 운영 상태 조회
  async getOperationStatus(storeId: number) {
    // 매장 존재 여부 확인
    await this.verifyStoreExists(storeId);

    // 운영 상태 조회
    const status = await this.operationStatusRepository.findOne({
      where: { storeId },
    });

    if (!status) {
      // 상태가 없으면 기본값 생성 (주문 수신 중)
      const newStatus = this.operationStatusRepository.create({
        storeId,
        isAcceptingOrders: true,
      });
      return this.operationStatusRepository.save(newStatus);
    }

    // 자동 재개 처리
    if (!status.isAcceptingOrders && status.pauseUntil && status.pauseUntil < new Date()) {
      status.isAcceptingOrders = true;
      status.pauseUntil = null;
      status.pauseReason = '';
      status.pauseType = null;
      await this.operationStatusRepository.save(status);

      // 일시 중지 이력 업데이트
      await this.updatePauseHistoryForResume(storeId);
    }

    return status;
  }

  // 주문 일시 중지
  async pauseOrders(storeId: number, pauseOrdersDto: PauseOrdersDto) {
    // 매장 존재 여부 확인
    await this.verifyStoreExists(storeId);

    const { pauseType, hours, pauseReason } = pauseOrdersDto;
    
    // 일시 중지 종료 시간 계산
    let pauseUntil: Date | null = null;

    if (pauseType === PauseType.TEMPORARY) {
      if (!hours || hours <= 0) {
        throw new BadRequestException('일시 중지의 경우 유효한 시간(hours)을 입력해야 합니다.');
      }
      pauseUntil = new Date();
      pauseUntil.setHours(pauseUntil.getHours() + hours);
    } else if (pauseType === PauseType.TODAY) {
      // 오늘 하루 (다음날 오전 6시까지)
      pauseUntil = new Date();
      pauseUntil.setDate(pauseUntil.getDate() + 1);
      pauseUntil.setHours(6, 0, 0, 0);
    }
    // INDEFINITE의 경우 pauseUntil은 null로 설정

    // 운영 상태 조회 또는 생성
    let status = await this.operationStatusRepository.findOne({
      where: { storeId },
    });

    if (!status) {
      status = this.operationStatusRepository.create({ storeId });
    }

    // 상태 업데이트
    status.isAcceptingOrders = false;
    status.pauseUntil = pauseUntil;
    status.pauseReason = pauseReason || '';
    status.pauseType = pauseType;

    await this.operationStatusRepository.save(status);

    // 이력 기록은 DB 트리거에서 처리됨

    return status;
  }

  // 주문 수신 재개
  async resumeOrders(storeId: number) {
    // 매장 존재 여부 확인
    await this.verifyStoreExists(storeId);

    // 운영 상태 조회
    const status = await this.operationStatusRepository.findOne({
      where: { storeId },
    });

    if (!status) {
      throw new NotFoundException(`매장 ID ${storeId}의 운영 상태를 찾을 수 없습니다.`);
    }

    // 이미 주문 수신 중인 경우
    if (status.isAcceptingOrders) {
      return status;
    }

    // 상태 업데이트
    status.isAcceptingOrders = true;
    status.pauseUntil = null;
    status.pauseReason = '';
    status.pauseType = null;

    await this.operationStatusRepository.save(status);
    
    // 일시 중지 이력 업데이트
    await this.updatePauseHistoryForResume(storeId);

    return status;
  }

  // 일시 중지 이력 조회
  async getPauseHistory(storeId: number, query: PauseHistoryQueryDto) {
    // 매장 존재 여부 확인
    await this.verifyStoreExists(storeId);

    const { startDate, endDate, pauseType, page = 1, limit = 10 } = query;
    
    // 조회 조건 구성
    const where: any = { storeId };
    
    // 날짜 범위 조건 추가
    if (startDate && endDate) {
      where.pausedAt = Between(
        new Date(`${startDate}T00:00:00Z`),
        new Date(`${endDate}T23:59:59Z`)
      );
    } else if (startDate) {
      where.pausedAt = MoreThanOrEqual(new Date(`${startDate}T00:00:00Z`));
    } else if (endDate) {
      where.pausedAt = LessThanOrEqual(new Date(`${endDate}T23:59:59Z`));
    }
    
    // 일시 중지 유형 조건 추가
    if (pauseType) {
      where.pauseType = pauseType;
    }

    // 페이지네이션 계산
    const skip = (page - 1) * limit;

    // 데이터 조회
    const [history, total] = await this.pauseHistoryRepository.findAndCount({
      where,
      order: {
        pausedAt: 'DESC',
      },
      skip,
      take: limit,
    });

    return {
      data: history,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 매장 존재 여부 확인 메서드
  private async verifyStoreExists(storeId: number): Promise<void> {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`매장 ID ${storeId}를 찾을 수 없습니다.`);
    }
  }

  // 주문 재개 시 일시 중지 이력 업데이트
  private async updatePauseHistoryForResume(storeId: number): Promise<void> {
    // 완료되지 않은(resumedAt이 null인) 가장 최근 일시 중지 이력 찾기
    const latestPauseHistory = await this.pauseHistoryRepository.findOne({
      where: {
        storeId,
        resumedAt: IsNull()
      },
      order: {
        pausedAt: 'DESC',
      },
    });

    if (latestPauseHistory) {
      // 현재 시간
      const now = new Date();
      
      // resumedAt 설정
      latestPauseHistory.resumedAt = now;
      
      // duration 계산 (밀리초를 초로 변환)
      const pausedAtTime = latestPauseHistory.pausedAt.getTime();
      const nowTime = now.getTime();
      const durationSeconds = Math.floor((nowTime - pausedAtTime) / 1000);
      
      // PostgreSQL의 interval 타입에 맞는 형식으로 변환
      latestPauseHistory.duration = `${durationSeconds} seconds`;
      
      await this.pauseHistoryRepository.save(latestPauseHistory);
    }
  }
  
  // 자동 상태 체크 (스케줄러용)
  async autoCheckPauseStatus(): Promise<void> {
    const now = new Date();
    
    // pauseUntil이 지났지만 아직 isAcceptingOrders가 false인 매장 찾기
    const statuses = await this.operationStatusRepository.find({
      where: {
        isAcceptingOrders: false,
        pauseUntil: LessThanOrEqual(now),
      },
    });
    
    // 각 매장의 상태 업데이트
    for (const status of statuses) {
      status.isAcceptingOrders = true;
      status.pauseUntil = null;
      status.pauseReason = '';
      status.pauseType = null;
      
      await this.operationStatusRepository.save(status);
      
      // 일시 중지 이력 업데이트
      await this.updatePauseHistoryForResume(status.storeId);
    }
  }
}