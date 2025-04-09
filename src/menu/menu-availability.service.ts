import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { MenuAvailability, DayOfWeek } from './entities/menu-availability.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { CreateMenuAvailabilityDto, UpdateMenuAvailabilityDto, MenuAvailabilityQueryDto } from './dto/menu-availability.dto';

@Injectable()
export class MenuAvailabilityService {
  constructor(
    @InjectRepository(MenuAvailability)
    private menuAvailabilityRepository: Repository<MenuAvailability>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  // 메뉴 항목의 모든 가용성 조회
  async findByMenuId(menuId: number, query?: MenuAvailabilityQueryDto) {
    // 메뉴 존재 여부 확인
    await this.verifyMenuExists(menuId);

    const whereCondition: any = { menuId };

    // 요일 필터링
    if (query?.dayOfWeek) {
      whereCondition.dayOfWeek = query.dayOfWeek;
    }

    // 가용 상태 필터링
    if (query?.isAvailable !== undefined) {
      whereCondition.isAvailable = query.isAvailable;
    }

    return this.menuAvailabilityRepository.find({
      where: whereCondition,
      order: { dayOfWeek: 'ASC' },
    });
  }

  // 특정 가용성 항목 조회
  async findOne(id: number) {
    const availability = await this.menuAvailabilityRepository.findOne({
      where: { id },
      relations: ['menuItem'],
    });

    if (!availability) {
      throw new NotFoundException(`Menu availability with ID ${id} not found`);
    }

    return availability;
  }

  // 메뉴에 가용성 설정 (개별)
  async create(menuId: number, createDto: CreateMenuAvailabilityDto) {
    // 메뉴 존재 여부 확인
    await this.verifyMenuExists(menuId);

    // 이미 해당 요일에 대한 가용성이 존재하는지 확인
    const existingAvailability = await this.menuAvailabilityRepository.findOne({
      where: { 
        menuId, 
        dayOfWeek: createDto.dayOfWeek 
      },
    });

    if (existingAvailability) {
      throw new BadRequestException(`Availability for ${createDto.dayOfWeek} already exists`);
    }

    // 가용 상태가 아닌데 시간 정보가 없는 경우 체크
    if (createDto.isAvailable !== false) {
      if (!createDto.startTime || !createDto.endTime) {
        throw new BadRequestException('Start and end times are required when menu is available');
      }
    }

    const availability = this.menuAvailabilityRepository.create({
      ...createDto,
      menuId,
    });

    return this.menuAvailabilityRepository.save(availability);
  }

  // 가용성 업데이트
  async update(id: number, updateDto: UpdateMenuAvailabilityDto) {
    const availability = await this.findOne(id);

    // 가용 상태가 아닌데 시간 정보가 없는 경우 체크
    if (updateDto.isAvailable !== false) {
      if (!updateDto.startTime && !availability.startTime) {
        throw new BadRequestException('Start time is required when menu is available');
      }

      if (!updateDto.endTime && !availability.endTime) {
        throw new BadRequestException('End time is required when menu is available');
      }
    }

    Object.assign(availability, updateDto);
    
    return this.menuAvailabilityRepository.save(availability);
  }

  // 가용성 삭제
  async remove(id: number) {
    const availability = await this.findOne(id);
    
    await this.menuAvailabilityRepository.remove(availability);
    
    return { id, deleted: true };
  }

  // 메뉴의 모든 가용성 삭제
  async removeAllByMenuId(menuId: number) {
    // 메뉴 존재 여부 확인
    await this.verifyMenuExists(menuId);

    await this.menuAvailabilityRepository.delete({ menuId });
    
    return { menuId, deleted: true };
  }

  // 메뉴 존재 여부 확인 유틸리티 메서드
  private async verifyMenuExists(menuId: number): Promise<MenuItem> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id: menuId },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu item with ID ${menuId} not found`);
    }

    return menuItem;
  }
}