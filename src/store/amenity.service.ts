import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Amenity } from './entities/amenity.entity';
import { StoreAmenity } from './entities/store-amenity.entity';
import { Store } from './entities/store.entity';
import { CreateAmenityDto, UpdateAmenityDto, StoreAmenityDto } from './dto/amenity.dto';

@Injectable()
export class AmenityService {
  constructor(
    @InjectRepository(Amenity)
    private amenityRepository: Repository<Amenity>,
    @InjectRepository(StoreAmenity)
    private storeAmenityRepository: Repository<StoreAmenity>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  // 모든 부가서비스 조회
  async findAll() {
    return this.amenityRepository.find({
      order: {
        name: 'ASC',
      },
    });
  }

  // 특정 부가서비스 조회
  async findOne(id: number) {
    const amenity = await this.amenityRepository.findOne({
      where: { id },
    });
    
    if (!amenity) {
      throw new NotFoundException(`부가서비스 ID ${id}를 찾을 수 없습니다.`);
    }
    
    return amenity;
  }

  // 부가서비스 생성 (관리자 전용)
  async create(createAmenityDto: CreateAmenityDto) {
    const newAmenity = this.amenityRepository.create(createAmenityDto);
    return this.amenityRepository.save(newAmenity);
  }

  // 부가서비스 수정 (관리자 전용)
  async update(id: number, updateAmenityDto: UpdateAmenityDto) {
    const amenity = await this.findOne(id);
    
    await this.amenityRepository.update(id, updateAmenityDto);
    
    return this.amenityRepository.findOne({
      where: { id },
    });
  }

  // 부가서비스 삭제 (관리자 전용)
  async remove(id: number) {
    const amenity = await this.findOne(id);
    
    // 부가서비스 사용여부 확인
    const usageCount = await this.storeAmenityRepository.count({
      where: { amenityId: id },
    });
    
    if (usageCount > 0) {
      throw new BadRequestException(`이 부가서비스는 ${usageCount}개의 매장에서 사용 중이므로 삭제할 수 없습니다.`);
    }
    
    await this.amenityRepository.remove(amenity);
    
    return {
      success: true,
      message: '부가서비스가 삭제되었습니다.',
    };
  }

  // 매장의 부가서비스 목록 조회
  async findByStoreId(storeId: number) {
    // 매장 존재 여부 확인
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`매장 ID ${storeId}를 찾을 수 없습니다.`);
    }

    // 매장-부가서비스 연결 조회
    const storeAmenities = await this.storeAmenityRepository.find({
      where: { storeId },
      relations: ['amenity'],
    });

    // 부가서비스 정보만 추출
    return storeAmenities.map(sa => sa.amenity);
  }

  // 매장 부가서비스 설정 (기존 부가서비스 모두 삭제 후 새로 설정)
  async setStoreAmenities(storeId: number, storeAmenityDto: StoreAmenityDto) {
    // 매장 존재 여부 확인
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`매장 ID ${storeId}를 찾을 수 없습니다.`);
    }

    const { amenityIds } = storeAmenityDto;
    
    // 중복 제거
    const uniqueAmenityIds = [...new Set(amenityIds)];
    
    // 부가서비스 존재 여부 확인
    if (uniqueAmenityIds.length > 0) {
      const existingAmenities = await this.amenityRepository.find({
        where: { id: In(uniqueAmenityIds) },
      });
      
      if (existingAmenities.length !== uniqueAmenityIds.length) {
        const foundIds = existingAmenities.map(a => a.id);
        const notFoundIds = uniqueAmenityIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(`다음 부가서비스 ID를 찾을 수 없습니다: ${notFoundIds.join(', ')}`);
      }
    }

    // 기존 연결 모두 삭제
    await this.storeAmenityRepository.delete({ storeId });
    
    // 새로운 연결 생성
    if (uniqueAmenityIds.length > 0) {
      const storeAmenities = uniqueAmenityIds.map(amenityId => ({
        storeId,
        amenityId,
      }));
      
      await this.storeAmenityRepository.insert(storeAmenities);
    }
    
    // 업데이트된 부가서비스 목록 반환
    return this.findByStoreId(storeId);
  }

  // 매장 부가서비스 추가 (기존 부가서비스는 유지)
  async addStoreAmenities(storeId: number, storeAmenityDto: StoreAmenityDto) {
    // 매장 존재 여부 확인
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`매장 ID ${storeId}를 찾을 수 없습니다.`);
    }

    const { amenityIds } = storeAmenityDto;
    
    // 중복 제거
    const uniqueAmenityIds = [...new Set(amenityIds)];
    
    // 부가서비스 존재 여부 확인
    if (uniqueAmenityIds.length > 0) {
      const existingAmenities = await this.amenityRepository.find({
        where: { id: In(uniqueAmenityIds) },
      });
      
      if (existingAmenities.length !== uniqueAmenityIds.length) {
        const foundIds = existingAmenities.map(a => a.id);
        const notFoundIds = uniqueAmenityIds.filter(id => !foundIds.includes(id));
        throw new BadRequestException(`다음 부가서비스 ID를 찾을 수 없습니다: ${notFoundIds.join(', ')}`);
      }
    } else {
      return this.findByStoreId(storeId);
    }

    // 기존 연결 조회
    const existingStoreAmenities = await this.storeAmenityRepository.find({
      where: { storeId },
    });
    
    const existingAmenityIds = existingStoreAmenities.map(sa => sa.amenityId);
    
    // 추가할 부가서비스 ID (중복 제외)
    const amenityIdsToAdd = uniqueAmenityIds.filter(
      id => !existingAmenityIds.includes(id)
    );
    
    // 새로운 연결 생성
    if (amenityIdsToAdd.length > 0) {
      const storeAmenitiesToAdd = amenityIdsToAdd.map(amenityId => ({
        storeId,
        amenityId,
      }));
      
      await this.storeAmenityRepository.insert(storeAmenitiesToAdd);
    }
    
    // 업데이트된 부가서비스 목록 반환
    return this.findByStoreId(storeId);
  }

  // 매장 부가서비스 삭제
  async removeStoreAmenities(storeId: number, storeAmenityDto: StoreAmenityDto) {
    // 매장 존재 여부 확인
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`매장 ID ${storeId}를 찾을 수 없습니다.`);
    }

    const { amenityIds } = storeAmenityDto;
    
    if (amenityIds.length === 0) {
      return this.findByStoreId(storeId);
    }
    
    // 중복 제거
    const uniqueAmenityIds = [...new Set(amenityIds)];
    
    // 해당 연결 삭제
    await this.storeAmenityRepository.delete({
      storeId,
      amenityId: In(uniqueAmenityIds),
    });
    
    // 업데이트된 부가서비스 목록 반환
    return this.findByStoreId(storeId);
  }
}