import { Injectable, NotFoundException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, FindManyOptions, FindOptionsWhere } from 'typeorm';
import { Store } from './entities/store.entity';
import { StoreCategory } from './entities/store-category.entity';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreQueryDto, SortBy, SortOrder } from './dto/store-query.dto';
import { OwnerProfile } from '../users/entities/owner-profile.entity';
import { S3Service } from '../common/services/s3.service';
import { Multer } from 'multer';

@Injectable()
export class StoreService {
  constructor(
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(StoreCategory)
    private categoryRepository: Repository<StoreCategory>,
    @InjectRepository(OwnerProfile)
    private ownerProfileRepository: Repository<OwnerProfile>,
    private s3Service: S3Service,
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

  async findOneByDomain(domain: string) {
    const store = await this.storeRepository.findOne({
      where: { domain },
      relations: ['owner'],
    });
    
    if (!store) {
      throw new NotFoundException(`상점 도메인 ${domain}을 찾을 수 없습니다.`);
    }
    
    return store;
  }
  
  async findByBusinessRegistrationNumber(businessRegistrationNumber: string) {
    return this.storeRepository.findOne({
      where: { businessRegistrationNumber },
    });
  }

  async create(
    ownerId: number, 
    createStoreDto: CreateStoreDto,
    files: {
      businessRegistrationFile?: Express.Multer.File;
      logoImage?: Express.Multer.File;
      bannerImage?: Express.Multer.File;
    }
  ) {
    console.log(ownerId);
    // 점주 프로필 확인
    const ownerProfile = await this.ownerProfileRepository.findOne({
      where: { id: ownerId },
    });
    
    console.log(ownerProfile);
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
    
    // Upload files to S3
    const businessRegistrationUrl = files.businessRegistrationFile ? 
      await this.s3Service.uploadFile(files.businessRegistrationFile, 'business-registration') : null;
    
    const logoImageUrl = files.logoImage ? 
      await this.s3Service.uploadFile(files.logoImage, 'logo') : null;
    
    const bannerImageUrl = files.bannerImage ? 
      await this.s3Service.uploadFile(files.bannerImage, 'banner') : null;

    console.log({
      ...createStoreDto,
      ownerId : ownerId,
      isVerified: false,
      businessRegistrationFile: businessRegistrationUrl,
      logoImage: logoImageUrl,
      bannerImage: bannerImageUrl,
    });
    const newStore = this.storeRepository.create({
      ...createStoreDto,
      ownerId,  // owner 객체 대신 직접 ownerId 설정
      isVerified: false,
      businessRegistrationFile: businessRegistrationUrl,
      logoImage: logoImageUrl,
      bannerImage: bannerImageUrl,
    } as Store);
    
    return this.storeRepository.save(newStore);
  }

  async update(
    id: number,
    ownerId: number,
    updateStoreDto: UpdateStoreDto,
    files: {
      logoImage?: Express.Multer.File;
      bannerImage?: Express.Multer.File;
    }
  ) {
    const store = await this.storeRepository.findOne({
      where: { id, ownerId },
    });

    if (!store) {
      throw new NotFoundException('Store not found');
    }

    let logoImageUrl = store.logoImage;
    let bannerImageUrl = store.bannerImage;

    if (files.logoImage) {
      const logoUrl = await this.s3Service.uploadFile(files.logoImage, 'logo');
      if (!logoUrl) {
        throw new Error('Failed to upload logo image');
      }
      logoImageUrl = logoUrl;
    }

    if (files.bannerImage) {
      const bannerUrl = await this.s3Service.uploadFile(files.bannerImage, 'banner');
      if (!bannerUrl) {
        throw new Error('Failed to upload banner image');
      }
      bannerImageUrl = bannerUrl;
    }

    const updatedStore = await this.storeRepository.save({
      ...store,
      ...updateStoreDto,
      logoImage: logoImageUrl,
      bannerImage: bannerImageUrl,
    });

    return updatedStore;
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
