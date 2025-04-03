import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreOperatingHour, DayOfWeek } from './entities/store-operating-hour.entity';
import { Store } from './entities/store.entity';
import { CreateOperatingHourDto, UpdateOperatingHourDto } from './dto/operating-hours.dto';

@Injectable()
export class OperatingHoursService {
  constructor(
    @InjectRepository(StoreOperatingHour)
    private operatingHourRepository: Repository<StoreOperatingHour>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  // 특정 매장의 모든 영업시간 조회
  async findAllByStoreId(storeId: number) {
    // 매장 존재 여부 확인
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // 영업시간 조회
    const operatingHours = await this.operatingHourRepository.find({
      where: { storeId },
      order: {
        dayOfWeek: 'ASC',
      },
    });

    // 요일별로 그룹화
    const operatingHoursByDay = this.groupByDay(operatingHours);

    return {
      operatingHours,
      operatingHoursByDay,
    };
  }

  // 특정 영업시간 조회
  async findOne(id: number) {
    const operatingHour = await this.operatingHourRepository.findOne({
      where: { id },
      relations: ['store'],
    });
    
    if (!operatingHour) {
      throw new NotFoundException(`Operating hour with ID ${id} not found`);
    }
    
    return operatingHour;
  }

  // 특정 매장의 특정 요일 영업시간 조회
  async findByStoreIdAndDay(storeId: number, dayOfWeek: DayOfWeek) {
    return this.operatingHourRepository.findOne({
      where: { storeId, dayOfWeek },
    });
  }

  // 영업시간 생성
  async create(storeId: number, createOperatingHourDto: CreateOperatingHourDto) {
    // 매장 존재 여부 확인
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // 이미 해당 요일에 영업시간이 존재하는지 확인
    const existingHour = await this.findByStoreIdAndDay(storeId, createOperatingHourDto.dayOfWeek);
    if (existingHour) {
      throw new BadRequestException(`Operating hour for ${createOperatingHourDto.dayOfWeek} already exists`);
    }

    // 휴무일이 아닌데 시간 정보가 없는 경우 체크
    if (!createOperatingHourDto.isDayOff) {
      if (!createOperatingHourDto.openingTime || !createOperatingHourDto.closingTime) {
        throw new BadRequestException('Opening and closing times are required when it is not a day off');
      }
    }

    // 휴게시간 유효성 검사
    if (createOperatingHourDto.breakStartTime && !createOperatingHourDto.breakEndTime) {
      throw new BadRequestException('Break end time is required when break start time is provided');
    }

    if (!createOperatingHourDto.breakStartTime && createOperatingHourDto.breakEndTime) {
      throw new BadRequestException('Break start time is required when break end time is provided');
    }

    // 영업시간 생성
    const operatingHour = this.operatingHourRepository.create({
      ...createOperatingHourDto,
      storeId,
    });

    return this.operatingHourRepository.save(operatingHour);
  }

  // 영업시간 일괄 생성 (배열로 받아서 처리)
  async createBulk(storeId: number, createOperatingHourDtos: CreateOperatingHourDto[]) {
    // 매장 존재 여부 확인
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }

    // 요일 중복 체크
    const days = createOperatingHourDtos.map(dto => dto.dayOfWeek);
    if (new Set(days).size !== days.length) {
      throw new BadRequestException('Duplicate days found in request');
    }

    // 기존 영업시간 조회
    const existingHours = await this.operatingHourRepository.find({
      where: { storeId },
    });

    // 존재하는 요일 체크
    for (const dto of createOperatingHourDtos) {
      const existing = existingHours.find(hour => hour.dayOfWeek === dto.dayOfWeek);
      if (existing) {
        throw new BadRequestException(`Operating hour for ${dto.dayOfWeek} already exists`);
      }

      // 휴무일이 아닌데 시간 정보가 없는 경우 체크
      if (!dto.isDayOff && (!dto.openingTime || !dto.closingTime)) {
        throw new BadRequestException(`Opening and closing times are required for ${dto.dayOfWeek} when it is not a day off`);
      }

      // 휴게시간 유효성 검사
      if (dto.breakStartTime && !dto.breakEndTime) {
        throw new BadRequestException(`Break end time is required for ${dto.dayOfWeek} when break start time is provided`);
      }

      if (!dto.breakStartTime && dto.breakEndTime) {
        throw new BadRequestException(`Break start time is required for ${dto.dayOfWeek} when break end time is provided`);
      }
    }

    // 영업시간 생성
    const operatingHours = createOperatingHourDtos.map(dto =>
      this.operatingHourRepository.create({
        ...dto,
        storeId,
      })
    );

    return this.operatingHourRepository.save(operatingHours);
  }

  // 특정 영업시간 업데이트
  async update(id: number, updateOperatingHourDto: UpdateOperatingHourDto) {
    const operatingHour = await this.findOne(id);

    // 휴무일 설정 여부에 따른 검증
    if (updateOperatingHourDto.isDayOff === false) {
      // 휴무일이 아닌데 오픈/마감 시간이 없으면 기존 값 검사
      if (!updateOperatingHourDto.openingTime && !operatingHour.openingTime) {
        throw new BadRequestException('Opening time is required when it is not a day off');
      }

      if (!updateOperatingHourDto.closingTime && !operatingHour.closingTime) {
        throw new BadRequestException('Closing time is required when it is not a day off');
      }
    }

    // 휴게시간 설정에 따른 검증
    const willHaveBreakStart = updateOperatingHourDto.breakStartTime || 
      (operatingHour.breakStartTime && updateOperatingHourDto.breakStartTime !== null);
    
    const willHaveBreakEnd = updateOperatingHourDto.breakEndTime || 
      (operatingHour.breakEndTime && updateOperatingHourDto.breakEndTime !== null);

    if (willHaveBreakStart && !willHaveBreakEnd) {
      throw new BadRequestException('Break end time is required when break start time is provided');
    }

    if (!willHaveBreakStart && willHaveBreakEnd) {
      throw new BadRequestException('Break start time is required when break end time is provided');
    }

    // 영업시간 업데이트
    await this.operatingHourRepository.update(id, updateOperatingHourDto);
    
    return this.findOne(id);
  }

  // 특정 요일 영업시간 업데이트
  async updateByDay(storeId: number, dayOfWeek: DayOfWeek, updateOperatingHourDto: UpdateOperatingHourDto) {
    const operatingHour = await this.findByStoreIdAndDay(storeId, dayOfWeek);
    
    if (!operatingHour) {
      throw new NotFoundException(`Operating hour for ${dayOfWeek} not found`);
    }
    
    return this.update(operatingHour.id, updateOperatingHourDto);
  }

  // 영업시간 삭제
  async remove(id: number) {
    const operatingHour = await this.findOne(id);
    
    await this.operatingHourRepository.remove(operatingHour);
    
    return { id, deleted: true };
  }

  // 특정 매장의 모든 영업시간 삭제
  async removeAllByStoreId(storeId: number) {
    await this.operatingHourRepository.delete({ storeId });
    
    return { storeId, deleted: true };
  }

  // 특정 요일 영업시간 삭제
  async removeByDay(storeId: number, dayOfWeek: DayOfWeek) {
    const operatingHour = await this.findByStoreIdAndDay(storeId, dayOfWeek);
    
    if (!operatingHour) {
      throw new NotFoundException(`Operating hour for ${dayOfWeek} not found`);
    }
    
    await this.operatingHourRepository.remove(operatingHour);
    
    return { storeId, dayOfWeek, deleted: true };
  }

  // 요일별로 그룹화 헬퍼 함수
  private groupByDay(operatingHours: StoreOperatingHour[]) {
    const result = {} as Record<DayOfWeek, StoreOperatingHour>;
    
    operatingHours.forEach(hour => {
      result[hour.dayOfWeek] = hour;
    });
    
    return result;
  }
}