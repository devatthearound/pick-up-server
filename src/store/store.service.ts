import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { Store } from './entities/store.entity';
import { StoreCategory } from './entities/store-category.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreQueryDto, SortBy, SortOrder } from './dto/store-query.dto';
import { OwnerProfile } from '../users/entities/owner-profile.entity';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(StoreCategory)
    private categoryRepository: Repository<StoreCategory>,
    @InjectRepository(OwnerProfile)
    private ownerProfileRepository: Repository<OwnerProfile>,
  ) {}

  async findAll(queryDto: StoreQueryDto) {
    const { page = 1, limit = 10, name, categoryId, ownerId, isActive, isVerified, sortBy = SortBy.CREATED_AT, sortOrder = SortOrder.DESC } = queryDto;
    
    const skip = (page - 1) * limit;
    
    // 필터링 조건 구성
    const where: FindOptionsWhere<Store> = {};
    
    if (name) {
      where.name = Like(`%${name}%`);
    }
    
    if (categoryId !== undefined) {
      where.categoryId = categoryId;
    }
    
    if (ownerId !== undefined) {
      where.ownerId = ownerId;
    }
    
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    
    if (isVerified !== undefined) {
      where.isVerified = isVerified;
    }
    
    // 정렬 옵션 구성
    const order = {};
    order[sortBy] = sortOrder;
    
    const [stores, total] = await this.storeRepository.findAndCount({
      where,
      order,
      skip,
      take: limit,
      relations: ['owner'],
    });
    
    return {
      data: stores,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const store = await this.storeRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    
    if (!store) {
      throw new NotFoundException(`상점 ID ${id}를 찾을 수 없습니다.`);
    }
    
    return store;
  }

  async findByBusinessRegistrationNumber(businessRegistrationNumber: string) {
    return this.storeRepository.findOne({
      where: { businessRegistrationNumber },
    });
  }

  async create(ownerId: number, createStoreDto: CreateStoreDto) {
    // 점주 프로필 확인
    const ownerProfile = await this.ownerProfileRepository.findOne({
      where: { id: ownerId },
    });
    
    if (!ownerProfile) {
      throw new NotFoundException(`점주 ID ${ownerId}를 찾을 수 없습니다.`);
    }
    
    // 카테고리 존재 여부 확인
    const category = await this.categoryRepository.findOne({
      where: { id: createStoreDto.categoryId },
    });
    
    if (!category) {
      throw new NotFoundException(`카테고리 ID ${createStoreDto.categoryId}를 찾을 수 없습니다.`);
    }
    
    // 사업자 등록 번호 중복 확인
    const existingStore = await this.findByBusinessRegistrationNumber(createStoreDto.businessRegistrationNumber);
    
    if (existingStore) {
      throw new ConflictException(`이미 등록된 사업자 등록 번호입니다: ${createStoreDto.businessRegistrationNumber}`);
    }
    
    // 저장할 데이터 준비
    const newStore = this.storeRepository.create({
      ...createStoreDto,
      ownerId,
      isVerified: false, // 관리자 인증 필요
    });
    
    return this.storeRepository.save(newStore);
  }

  async update(id: number, ownerId: number, updateStoreDto: UpdateStoreDto) {
    const store = await this.storeRepository.findOne({
      where: { id },
    });
    
    if (!store) {
      throw new NotFoundException(`상점 ID ${id}를 찾을 수 없습니다.`);
    }
    
    // 권한 확인: 본인 소유의 상점인지 확인
    if (store.ownerId !== ownerId) {
      throw new BadRequestException('해당 상점을 수정할 권한이 없습니다.');
    }
    
    // 사업자 등록 번호 변경 시 중복 확인
    if (updateStoreDto.businessRegistrationNumber && updateStoreDto.businessRegistrationNumber !== store.businessRegistrationNumber) {
      const existingStore = await this.findByBusinessRegistrationNumber(updateStoreDto.businessRegistrationNumber);
      
      if (existingStore && existingStore.id !== id) {
        throw new ConflictException(`이미 등록된 사업자 등록 번호입니다: ${updateStoreDto.businessRegistrationNumber}`);
      }
    }
    
    // 카테고리 ID 변경 시 존재 여부 확인
    if (updateStoreDto.categoryId && updateStoreDto.categoryId !== store.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: updateStoreDto.categoryId },
      });
      
      if (!category) {
        throw new NotFoundException(`카테고리 ID ${updateStoreDto.categoryId}를 찾을 수 없습니다.`);
      }
    }
    
    // isVerified는 관리자만 변경 가능하므로 일반 업데이트에서는 제외
    delete updateStoreDto.isVerified;
    
    // 데이터 업데이트
    await this.storeRepository.update(id, updateStoreDto);
    
    return this.storeRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  async remove(id: number, ownerId: number) {
    const store = await this.storeRepository.findOne({
      where: { id },
    });
    
    if (!store) {
      throw new NotFoundException(`상점 ID ${id}를 찾을 수 없습니다.`);
    }
    
    // 권한 확인: 본인 소유의 상점인지 확인
    if (store.ownerId !== ownerId) {
      throw new BadRequestException('해당 상점을 삭제할 권한이 없습니다.');
    }
    
    // 소프트 삭제 사용 (deletedAt 설정)
    await this.storeRepository.softDelete(id);
    
    return { success: true, message: '상점이 삭제되었습니다.' };
  }

  async verifyStore(id: number, isVerified: boolean) {
    const store = await this.storeRepository.findOne({
      where: { id },
    });
    
    if (!store) {
      throw new NotFoundException(`상점 ID ${id}를 찾을 수 없습니다.`);
    }
    
    await this.storeRepository.update(id, { isVerified });
    
    return this.storeRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
  }

  async getStoresByOwnerId(ownerId: number) {
    return this.storeRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }
}
