import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuCategory } from './entities/menu-category.entity';
import { MenuItemCategory } from './entities/menu-item-category.entity';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto, MenuCategoryQueryDto } from './dto/menu-category.dto';
import { Store } from '../store/entities/store.entity';

@Injectable()
export class MenuCategoryService {
  constructor(
    @InjectRepository(MenuCategory)
    private readonly menuCategoryRepository: Repository<MenuCategory>,
    @InjectRepository(MenuItemCategory)
    private readonly menuItemCategoryRepository: Repository<MenuItemCategory>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  async findAll(query: MenuCategoryQueryDto) {
    const { page = 1, limit = 10, isActive, storeId } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.menuCategoryRepository.createQueryBuilder('menuCategory')
      .leftJoinAndSelect('menuCategory.menuItemCategories', 'menuItemCategory')
      .leftJoinAndSelect('menuItemCategory.menuItem', 'menuItem');

    if (typeof isActive === 'boolean') {
      queryBuilder.andWhere('menuCategory.isActive = :isActive', { isActive });
    }

    if (storeId) {
      queryBuilder.andWhere('menuCategory.storeId = :storeId', { storeId });
    }

    queryBuilder
      .orderBy('menuCategory.displayOrder', 'ASC')
      .addOrderBy('menuCategory.name', 'ASC')
      .skip(skip)
      .take(limit);

    const [categories, total] = await queryBuilder.getManyAndCount();

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const category = await this.menuCategoryRepository.findOne({
      where: { id },
      relations: ['menuItemCategories', 'menuItemCategories.menuItem'],
    });

    if (!category) {
      throw new NotFoundException(`메뉴 카테고리 ID ${id}를 찾을 수 없습니다.`);
    }

    return category;
  }

  async findByStoreId(storeId: number) {
    return this.menuCategoryRepository.find({
      where: { storeId, isActive: true },
      relations: ['menuItemCategories', 'menuItemCategories.menuItem'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findByStoreDomain(storeDomain: string) {
    try {
      const store = await this.storeRepository.findOne({
        where: { domain: storeDomain },
      });

      if (!store) {
        throw new NotFoundException(`매장 도메인 ${storeDomain}을 찾을 수 없습니다.`);
      }

      return this.menuCategoryRepository.find({
        where: { storeId: store.id, isActive: true },
        relations: ['menuItemCategories', 'menuItemCategories.menuItem'],
        order: { displayOrder: 'ASC', name: 'ASC' },
      });
    } catch (error) {
      throw new NotFoundException(`매장 도메인 ${storeDomain}을 찾을 수 없습니다.`);
    }
  }

  async verifyStoreOwnership(storeId: number, userId: number) {
    const count = await this.storeRepository.createQueryBuilder('store')
      .where('store.id = :storeId', { storeId })
      .andWhere('store.ownerId = :ownerId', { ownerId: userId })
      .getCount();

    if (count === 0) {
      throw new ForbiddenException('이 매장에 대한 권한이 없습니다.');
    }

    return true;
  }

  async create(storeId: number, dto: CreateMenuCategoryDto) {
    const category = this.menuCategoryRepository.create({
      ...dto,
      storeId,
    });

    return this.menuCategoryRepository.save(category);
  }

  async update(id: number, dto: UpdateMenuCategoryDto) {
    const category = await this.findOne(id);
    
    Object.assign(category, dto);
    
    return this.menuCategoryRepository.save(category);
  }

  async remove(id: number) {
    const category = await this.findOne(id);
    return this.menuCategoryRepository.remove(category);
  }
}
