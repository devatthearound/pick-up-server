import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual, IsNull } from 'typeorm';
import { StoreBenefit } from './entities/store-benefit.entity';
import { Store } from './entities/store.entity';
import { 
  CreateStoreBenefitDto, 
  UpdateStoreBenefitDto, 
  StoreBenefitQueryDto 
} from './dto/store-benefit.dto';

@Injectable()
export class StoreBenefitService {
  constructor(
    @InjectRepository(StoreBenefit)
    private storeBenefitRepository: Repository<StoreBenefit>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  // 상점의 혜택 목록 조회
  async findByStoreId(storeId: number, query: StoreBenefitQueryDto) {
    const { page = 1, limit = 10, isActive, isOngoing } = query;
    const skip = (page - 1) * limit;

    // 기본 쿼리 빌더
    const queryBuilder = this.storeBenefitRepository.createQueryBuilder('benefit')
      .where('benefit.storeId = :storeId', { storeId });

    // 활성 상태 필터링
    if (isActive !== undefined) {
      queryBuilder.andWhere('benefit.isActive = :isActive', { isActive });
    }

    // 진행 중인 혜택 필터링
    if (isOngoing === true) {
      const now = new Date();
      queryBuilder.andWhere('benefit.endDate IS NULL OR benefit.endDate >= :now', { now });
    } else if (isOngoing === false) {
      const now = new Date();
      queryBuilder.andWhere('benefit.endDate < :now', { now });
    }

    // 정렬 및 페이지네이션
    queryBuilder
      .orderBy('benefit.displayOrder', 'ASC')
      .addOrderBy('benefit.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    const [benefits, total] = await queryBuilder.getManyAndCount();

    return {
      data: benefits,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // 특정 혜택 상세 조회
  async findOne(id: number) {
    const benefit = await this.storeBenefitRepository.findOne({
      where: { id },
      relations: ['store'],
    });

    if (!benefit) {
      throw new NotFoundException(`Store benefit with ID ${id} not found`);
    }

    return benefit;
  }

  // 혜택 생성
  async create(storeId: number, createDto: CreateStoreBenefitDto) {
    // 상점 존재 여부 확인
    await this.verifyStoreExists(storeId);

    const benefit = this.storeBenefitRepository.create({
      ...createDto,
      storeId,
    });

    return this.storeBenefitRepository.save(benefit);
  }

  // 혜택 수정
  async update(id: number, updateDto: UpdateStoreBenefitDto) {
    const benefit = await this.findOne(id);

    // 종료 날짜 유효성 검사
    if (updateDto.endDate) {
      const endDate = new Date(updateDto.endDate);
      const now = new Date();

      if (endDate < now) {
        throw new BadRequestException('종료 날짜는 현재 날짜 이후여야 합니다.');
      }
    }

    Object.assign(benefit, updateDto);
    
    return this.storeBenefitRepository.save(benefit);
  }

  // 혜택 삭제
  async remove(id: number) {
    const benefit = await this.findOne(id);
    
    await this.storeBenefitRepository.remove(benefit);
    
    return { id, deleted: true };
  }

  // 상점의 모든 혜택 삭제
  async removeAllByStoreId(storeId: number) {
    // 상점 존재 여부 확인
    await this.verifyStoreExists(storeId);

    await this.storeBenefitRepository.delete({ storeId });
    
    return { storeId, deleted: true };
  }

  // 상점 존재 여부 확인 내부 메서드
  private async verifyStoreExists(storeId: number) {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }
  }

  // 현재 진행 중인 혜택 조회
  async findOngoingBenefits(storeId: number) {
    const now = new Date();
    
    return this.storeBenefitRepository.find({
      where: [
        { 
          storeId, 
          isActive: true, 
          endDate: MoreThanOrEqual(now) 
        },
        { 
          storeId, 
          isActive: true, 
          endDate: IsNull() 
        }
      ],
      order: { displayOrder: 'ASC' },
    });
  }
}