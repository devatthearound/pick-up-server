import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { StoreSpecialDay } from './entities/store-special-day.entity';
import { Store } from './entities/store.entity';
import { CreateSpecialDayDto, UpdateSpecialDayDto, SpecialDayQueryDto } from './dto/special-day.dto';

@Injectable()
export class SpecialDaysService {
  constructor(
    @InjectRepository(StoreSpecialDay)
    private specialDayRepository: Repository<StoreSpecialDay>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  // 매장의 특별 영업일/휴무일 목록 조회
  async findAllByStoreId(storeId: number, query: SpecialDayQueryDto) {
    // 매장 존재 여부 확인
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // 조회 조건 구성
    const where: any = { storeId };
    
    // 날짜 범위 조건 추가
    if (query.startDate && query.endDate) {
      // 시작일과 종료일 모두 있는 경우
      where.date = Between(query.startDate, query.endDate);
    } else if (query.startDate) {
      // 시작일만 있는 경우
      where.date = MoreThanOrEqual(query.startDate);
    } else if (query.endDate) {
      // 종료일만 있는 경우
      where.date = LessThanOrEqual(query.endDate);
    }
    
    // 휴무일 여부 조건 추가
    if (query.isClosed !== undefined) {
      where.isClosed = query.isClosed;
    }

    // 데이터 조회
    const specialDays = await this.specialDayRepository.find({
      where,
      order: {
        date: 'ASC',
      },
    });

    return specialDays;
  }

  // 특정 특별 영업일/휴무일 조회
  async findOne(id: number) {
    const specialDay = await this.specialDayRepository.findOne({
      where: { id },
      relations: ['store'],
    });
    
    if (!specialDay) {
      throw new NotFoundException(`Special day with ID ${id} not found`);
    }
    
    return specialDay;
  }

  // 특정 날짜의 특별 영업일/휴무일 조회
  async findByDate(storeId: number, date: string) {
    return this.specialDayRepository.findOne({
      where: { storeId, date },
    });
  }

  // 특별 영업일/휴무일 생성
  async create(storeId: number, createSpecialDayDto: CreateSpecialDayDto) {
    // 매장 존재 여부 확인
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // 이미 해당 날짜에 특별 영업일/휴무일이 존재하는지 확인
    const existingDay = await this.findByDate(storeId, createSpecialDayDto.date);
    if (existingDay) {
      throw new BadRequestException(`Special day for ${createSpecialDayDto.date} already exists`);
    }

    // 휴무일이 아닌데 영업 시간 정보가 없는 경우 체크
    if (!createSpecialDayDto.isClosed) {
      if (!createSpecialDayDto.openingTime || !createSpecialDayDto.closingTime) {
        throw new BadRequestException('Opening and closing times are required when it is not a closed day');
      }
    }

    // 특별 영업일/휴무일 생성
    const specialDay = this.specialDayRepository.create({
      ...createSpecialDayDto,
      storeId,
    });

    return this.specialDayRepository.save(specialDay);
  }

  // 특별 영업일/휴무일 업데이트
  async update(id: number, updateSpecialDayDto: UpdateSpecialDayDto) {
    const specialDay = await this.findOne(id);

    // 휴무일 설정 여부에 따른 검증
    if (updateSpecialDayDto.isClosed === false) {
      // 휴무일이 아닌데 오픈/마감 시간이 없으면 기존 값 검사
      if (!updateSpecialDayDto.openingTime && !specialDay.openingTime) {
        throw new BadRequestException('Opening time is required when it is not a closed day');
      }

      if (!updateSpecialDayDto.closingTime && !specialDay.closingTime) {
        throw new BadRequestException('Closing time is required when it is not a closed day');
      }
    }

    // 특별 영업일/휴무일 업데이트
    await this.specialDayRepository.update(id, updateSpecialDayDto);
    
    return this.findOne(id);
  }

  // 특별 영업일/휴무일 삭제
  async remove(id: number) {
    const specialDay = await this.findOne(id);
    
    await this.specialDayRepository.remove(specialDay);
    
    return { id, deleted: true };
  }

  // 특정 매장의 모든 특별 영업일/휴무일 삭제
  async removeAllByStoreId(storeId: number) {
    await this.specialDayRepository.delete({ storeId });
    
    return { storeId, deleted: true };
  }

  // 날짜 범위로 특별 영업일/휴무일 삭제
  async removeByDateRange(storeId: number, startDate: string, endDate: string) {
    await this.specialDayRepository.delete({
      storeId,
      date: Between(startDate, endDate),
    });
    
    return { storeId, startDate, endDate, deleted: true };
  }
}