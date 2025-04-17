import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuItem } from './entities/menu-item.entity';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto } from './dto/menu-item.dto';
import { Store } from '../store/entities/store.entity';
import { Multer } from 'multer';
import { Express } from 'express';
import { S3Service } from 'src/common/services/s3.service';

@Injectable()
export class MenuItemService {
  constructor(
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
    private readonly s3Service: S3Service,
  ) {}

  async findAll(query: MenuItemQueryDto) {
    const { 
      page = 1, 
      limit = 10, 
      storeId, 
      categoryId, 
      isAvailable, 
      isPopular, 
      isNew, 
      isRecommended 
    } = query;
    
    const skip = (page - 1) * limit;

    const queryBuilder = this.menuItemRepository.createQueryBuilder('menuItem')
      .leftJoinAndSelect('menuItem.category', 'category');

    if (storeId) {
      queryBuilder.andWhere('menuItem.storeId = :storeId', { storeId });
    }

    if (categoryId) {
      queryBuilder.andWhere('menuItem.categoryId = :categoryId', { categoryId });
    }

    if (typeof isAvailable === 'boolean') {
      queryBuilder.andWhere('menuItem.isAvailable = :isAvailable', { isAvailable });
    }

    if (typeof isPopular === 'boolean') {
      queryBuilder.andWhere('menuItem.isPopular = :isPopular', { isPopular });
    }

    if (typeof isNew === 'boolean') {
      queryBuilder.andWhere('menuItem.isNew = :isNew', { isNew });
    }

    if (typeof isRecommended === 'boolean') {
      queryBuilder.andWhere('menuItem.isRecommended = :isRecommended', { isRecommended });
    }

    queryBuilder.andWhere('menuItem.isDeleted = :isDeleted', { isDeleted: false });

    queryBuilder
      .orderBy('menuItem.displayOrder', 'ASC')
      .addOrderBy('menuItem.name', 'ASC')
      .skip(skip)
      .take(limit);

    const [menuItems, total] = await queryBuilder.getManyAndCount();

    return {
      data: menuItems,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: number) {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id },
      relations: ['category'],
    });

    if (!menuItem) {
      throw new NotFoundException(`메뉴 아이템 ID ${id}를 찾을 수 없습니다.`);
    }

    return menuItem;
  }

  async findByStoreId(storeId: number) {
    return this.menuItemRepository.find({
      where: { storeId, isAvailable: true },
      relations: ['category'],
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async findByCategoryId(categoryId: number) {
    return this.menuItemRepository.find({
      where: { categoryId, isAvailable: true },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async verifyStoreOwnership(storeId: number, userId: number) {
    const store = await this.storeRepository.findOne({
      where: { id: storeId, ownerId: userId },
    });

    if (!store) {
      throw new ForbiddenException('이 매장에 대한 권한이 없습니다.');
    }

    return true;
  }

  async create(storeId: number, dto: CreateMenuItemDto, image: Express.Multer.File) {
    // 이미지 업로드 처리 (S3 서비스 사용 가정)
    let imageUrl: string | null = null;
    if (image) {
      imageUrl = await this.s3Service.uploadFile(image, 'menu-items');
    }

    const menuItem = this.menuItemRepository.create({
      ...dto,
      storeId,
      imageUrl,
      isAvailable: true,
      isPopular: dto.isPopular || false,
      isNew: dto.isNew || false,
      isRecommended: dto.isRecommended || false,
      price: Number(dto.price),
      discountedPrice: dto.discountedPrice ? Number(dto.discountedPrice) : null,
      preparationTime: dto.preparationTime ? Number(dto.preparationTime) : null,
      categoryId: dto.categoryId ? Number(dto.categoryId) : null,
      displayOrder: 0,
      stockQuantity: null,
    } as unknown as MenuItem);

    return this.menuItemRepository.save(menuItem);
  }

  async update(id: number, dto: UpdateMenuItemDto, image: Express.Multer.File) {
    const menuItem = await this.findOne(id);
    
    if (image) {
      try {
        const imageUrl = await this.s3Service.uploadFile(image, 'menu-items');
        dto.imageUrl = imageUrl;
      } catch (error) {
        console.error('Image upload failed:', error);
        throw new Error('이미지 업로드에 실패했습니다.');
      }
    }

    Object.assign(menuItem, {
      ...dto,
      price: dto.price ? Number(dto.price) : menuItem.price,
      discountedPrice: dto.discountedPrice ? Number(dto.discountedPrice) : menuItem.discountedPrice,
      preparationTime: dto.preparationTime ? Number(dto.preparationTime) : menuItem.preparationTime,
      categoryId: dto.categoryId ? Number(dto.categoryId) : menuItem.categoryId,
    });
    
    return this.menuItemRepository.save(menuItem);
  }

  async remove(id: number) {
    const menuItem = await this.findOne(id);
    return this.menuItemRepository.remove(menuItem);
  }

  async updateStock(id: number, quantity: number) {
    const menuItem = await this.findOne(id);
    
    if (menuItem.stockQuantity !== null) {
      menuItem.stockQuantity = Math.max(0, (menuItem.stockQuantity || 0) - quantity);
      
      if (menuItem.stockQuantity === 0) {
        menuItem.isAvailable = false;
      }
      
      return this.menuItemRepository.save(menuItem);
    }
    
    return menuItem;
  }

  async findPopularItems(storeId: number, limit = 10) {
    return this.menuItemRepository.find({
      where: { storeId, isAvailable: true, isPopular: true },
      relations: ['category'],
      order: { displayOrder: 'ASC' },
      take: limit,
    });
  }

  async findNewItems(storeId: number, limit = 10) {
    return this.menuItemRepository.find({
      where: { storeId, isAvailable: true, isNew: true },
      relations: ['category'],
      order: { displayOrder: 'ASC' },
      take: limit,
    });
  }

  async findRecommendedItems(storeId: number, limit = 10) {
    return this.menuItemRepository.find({
      where: { storeId, isAvailable: true, isRecommended: true },
      relations: ['category'],
      order: { displayOrder: 'ASC' },
      take: limit,
    });
  }

  async deactivate(id: number) {
    const menuItem = await this.findOne(id);
    menuItem.isAvailable = false;
    menuItem.isDeleted = true;
    menuItem.deletedAt = new Date();
    return this.menuItemRepository.save(menuItem);
  }
}
