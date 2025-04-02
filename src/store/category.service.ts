import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StoreCategory } from './entities/store-category.entity';
import { CreateCategoryDto, UpdateCategoryDto } from './dto/category.dto';
import { Store } from './entities/store.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(StoreCategory)
    private categoryRepository: Repository<StoreCategory>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
  ) {}

  async findAll(isActive?: boolean) {
    const query = this.categoryRepository.createQueryBuilder('category');
    
    if (isActive !== undefined) {
      query.where('category.isActive = :isActive', { isActive });
    }
    
    query.orderBy('category.displayOrder', 'ASC');
    query.addOrderBy('category.name', 'ASC');
    
    return query.getMany();
  }

  async findOne(id: number) {
    const category = await this.categoryRepository.findOne({
      where: { id },
    });
    
    if (!category) {
      throw new NotFoundException(`카테고리 ID ${id}를 찾을 수 없습니다.`);
    }
    
    return category;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const newCategory = this.categoryRepository.create(createCategoryDto);
    return this.categoryRepository.save(newCategory);
  }

  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    const category = await this.findOne(id);
    
    await this.categoryRepository.update(id, updateCategoryDto);
    
    return this.categoryRepository.findOne({
      where: { id },
    });
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    
    // 해당 카테고리를 사용하는 상점이 있는지 확인
    const hasStores = await this.storeRepository.count({
      where: { categoryId: id },
    });
    
    if (hasStores > 0) {
      throw new BadRequestException(`이 카테고리를 사용하는 ${hasStores}개의 상점이 있어 삭제할 수 없습니다.`);
    }
    
    await this.categoryRepository.remove(category);
    
    return {
      success: true,
      message: '카테고리가 삭제되었습니다.',
    };
  }
}
