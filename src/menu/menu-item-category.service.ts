import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItemCategory } from './entities/menu-item-category.entity';
import { CreateMenuItemCategoryDto, UpdateMenuItemCategoryDto, MenuItemCategoryQueryDto } from './dto/menu-item-category.dto';
import { MenuItemService } from './menu-item.service';
import { MenuCategoryService } from './menu-category.service';
import { StoreService } from '../store/store.service';
@Injectable()
export class MenuItemCategoryService {
  constructor(
    @InjectRepository(MenuItemCategory)
    private readonly menuItemCategoryRepository: Repository<MenuItemCategory>,
    private readonly menuItemService: MenuItemService,
    private readonly menuCategoryService: MenuCategoryService,
    private readonly storeService: StoreService,
  ) {}

  async findByDomain(storeDomain: string, query: MenuItemCategoryQueryDto) {
    const store = await this.storeService.findOneByDomain(storeDomain);
    if(!store) {
      throw new NotFoundException(`매장을 찾을 수 없습니다. (도메인: ${storeDomain})`);
    }
    const qb = this.menuItemCategoryRepository.createQueryBuilder('mic')
      .where('mic.storeId = :storeId', { storeId: store.id })
      .leftJoinAndSelect('mic.menuItem', 'menuItem')
      .leftJoinAndSelect('mic.category', 'category');

    if (query.menuItemId) {
      qb.andWhere('mic.menuItemId = :menuItemId', { menuItemId: query.menuItemId });
    }

    if (query.categoryId) {
      qb.andWhere('mic.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    qb.orderBy('mic.displayOrder', 'ASC');

    return qb.getMany();
  }

  async findAll(query: MenuItemCategoryQueryDto) {
    const qb = this.menuItemCategoryRepository.createQueryBuilder('mic')
      .leftJoinAndSelect('mic.menuItem', 'menuItem')
      .leftJoinAndSelect('mic.category', 'category');

    if (query.menuItemId) {
      qb.andWhere('mic.menuItemId = :menuItemId', { menuItemId: query.menuItemId });
    }

    if (query.categoryId) {
      qb.andWhere('mic.categoryId = :categoryId', { categoryId: query.categoryId });
    }

    qb.orderBy('mic.displayOrder', 'ASC')
      .addOrderBy('mic.createdAt', 'DESC');

    return qb.getMany();
  }

  async findOne(id: number) {
    const menuItemCategory = await this.menuItemCategoryRepository.findOne({
      where: { id },
      relations: ['menuItem', 'category'],
      order: {
        displayOrder: 'ASC',
        createdAt: 'DESC'
      }
    });

    if (!menuItemCategory) {
      throw new NotFoundException(`메뉴 아이템-카테고리 관계를 찾을 수 없습니다. (ID: ${id})`);
    }

    return menuItemCategory;
  }

  async create(createMenuItemCategoryDto: CreateMenuItemCategoryDto) {
    // 메뉴 아이템과 카테고리 존재 여부 확인
    const menuItem = await this.menuItemService.findOne(createMenuItemCategoryDto.menuItemId);
    await this.menuCategoryService.findOne(createMenuItemCategoryDto.categoryId);

    // 이미 존재하는 관계인지 확인
    const existing = await this.menuItemCategoryRepository.findOne({
      where: {
        menuItemId: createMenuItemCategoryDto.menuItemId,
        categoryId: createMenuItemCategoryDto.categoryId,
      },
    });

    if (existing) {
      throw new Error('이미 존재하는 메뉴 아이템-카테고리 관계입니다.');
    }

    const menuItemCategory = this.menuItemCategoryRepository.create({
      ...createMenuItemCategoryDto,
      storeId: menuItem.storeId,
    });
    return this.menuItemCategoryRepository.save(menuItemCategory);
  }

  async update(id: number, updateMenuItemCategoryDto: UpdateMenuItemCategoryDto) {
    const menuItemCategory = await this.findOne(id);
    Object.assign(menuItemCategory, updateMenuItemCategoryDto);
    return this.menuItemCategoryRepository.save(menuItemCategory);
  }

  async remove(id: number) {
    const menuItemCategory = await this.findOne(id);
    await this.menuItemCategoryRepository.remove(menuItemCategory);
    return { success: true };
  }

  async findByMenuItemId(menuItemId: number) {
    return this.menuItemCategoryRepository.find({
      where: { menuItemId },
      relations: ['category'],
      order: {
        displayOrder: 'ASC',
        createdAt: 'DESC'
      }
    });
  }

  async findByCategoryId(categoryId: number) {
    return this.menuItemCategoryRepository.find({
      where: { categoryId },
      relations: ['menuItem'],
      order: {
        displayOrder: 'ASC',
        createdAt: 'DESC'
      }
    });
  }

  async verifyStoreOwnership(menuItemCategoryId: number, ownerId: number) {
    const menuItemCategory = await this.findOne(menuItemCategoryId);
    await this.menuItemService.verifyStoreOwnership(menuItemCategory.storeId, ownerId);
  }
} 