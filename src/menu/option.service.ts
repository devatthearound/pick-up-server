import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { OptionGroup } from './entities/option_groups.entity';
import { OptionItem } from './entities/option_items.entity';
import { MenuOptionGroup } from './entities/menu_option_groups.entity';
import { Store } from '../store/entities/store.entity';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { 
  CreateOptionGroupDto, 
  UpdateOptionGroupDto, 
  CreateOptionItemDto, 
  UpdateOptionItemDto, 
  CreateMenuOptionGroupDto, 
  UpdateMenuOptionGroupDto,
  OptionGroupQueryDto
} from './dto/option.dto';

@Injectable()
export class OptionService {
  constructor(
    @InjectRepository(OptionGroup)
    private optionGroupRepository: Repository<OptionGroup>,
    @InjectRepository(OptionItem)
    private optionItemRepository: Repository<OptionItem>,
    @InjectRepository(MenuOptionGroup)
    private menuOptionGroupRepository: Repository<MenuOptionGroup>,
    @InjectRepository(Store)
    private storeRepository: Repository<Store>,
    @InjectRepository(MenuItem)
    private menuItemRepository: Repository<MenuItem>,
  ) {}

  // Option Group Methods
  async findAllOptionGroups(query: OptionGroupQueryDto) {
    const { page = 1, limit = 10, storeId, isRequired } = query;
    const skip = (page - 1) * limit;

    const whereCondition: any = {};
    if (storeId) whereCondition.storeId = storeId;
    if (isRequired !== undefined) whereCondition.isRequired = isRequired;

    const [optionGroups, total] = await this.optionGroupRepository.findAndCount({
      where: whereCondition,
      relations: ['optionItems'],
      order: { displayOrder: 'ASC', name: 'ASC' },
      skip,
      take: limit,
    });

    return {
      data: optionGroups,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOptionGroupById(id: number) {
    const optionGroup = await this.optionGroupRepository.findOne({
      where: { id },
      relations: ['optionItems'],
    });

    if (!optionGroup) {
      throw new NotFoundException(`Option Group with ID ${id} not found`);
    }

    return optionGroup;
  }

  async createOptionGroup(storeId: number, dto: CreateOptionGroupDto) {
    // Verify store exists
    await this.verifyStoreExists(storeId);

    const optionGroup = this.optionGroupRepository.create({
      ...dto,
      storeId,
    });

    return this.optionGroupRepository.save(optionGroup);
  }

  async updateOptionGroup(id: number, dto: UpdateOptionGroupDto) {
    const optionGroup = await this.findOptionGroupById(id);

    // Validate min and max selections
    if (dto.minSelections !== undefined && dto.maxSelections !== undefined) {
      if (dto.minSelections > dto.maxSelections) {
        throw new BadRequestException('Minimum selections cannot be greater than maximum selections');
      }
    }

    Object.assign(optionGroup, dto);
    return this.optionGroupRepository.save(optionGroup);
  }

  async deleteOptionGroup(id: number) {
    const optionGroup = await this.findOptionGroupById(id);
    
    // Check if the option group is used in any menu items
    const menuOptionGroupCount = await this.menuOptionGroupRepository.count({
      where: { optionGroupId: id },
    });

    if (menuOptionGroupCount > 0) {
      throw new BadRequestException(`Option group is used in ${menuOptionGroupCount} menu items and cannot be deleted`);
    }

    return this.optionGroupRepository.remove(optionGroup);
  }

  // Option Item Methods
  async findOptionItemsByGroupId(groupId: number) {
    await this.findOptionGroupById(groupId); // Verify group exists

    return this.optionItemRepository.find({
      where: { groupId },
      order: { displayOrder: 'ASC', name: 'ASC' },
    });
  }

  async createOptionItem(groupId: number, dto: CreateOptionItemDto) {
    // Verify group exists
    await this.findOptionGroupById(groupId);

    const optionItem = this.optionItemRepository.create({
      ...dto,
      groupId,
    });

    return this.optionItemRepository.save(optionItem);
  }

  async updateOptionItem(id: number, dto: UpdateOptionItemDto) {
    const optionItem = await this.optionItemRepository.findOne({
      where: { id },
      relations: ['group'],
    });

    if (!optionItem) {
      throw new NotFoundException(`Option Item with ID ${id} not found`);
    }

    Object.assign(optionItem, dto);
    return this.optionItemRepository.save(optionItem);
  }

  async deleteOptionItem(id: number) {
    const optionItem = await this.optionItemRepository.findOne({
      where: { id },
      relations: ['group'],
    });

    if (!optionItem) {
      throw new NotFoundException(`Option Item with ID ${id} not found`);
    }

    return this.optionItemRepository.remove(optionItem);
  }

  // Menu Option Group Methods
  async findMenuOptionGroupsByMenuId(menuId: number) {
    // Verify menu exists
    await this.verifyMenuExists(menuId);

    return this.menuOptionGroupRepository.find({
      where: { menuId },
      relations: ['optionGroup', 'optionGroup.optionItems'],
      order: { displayOrder: 'ASC' },
    });
  }

  async createMenuOptionGroup(dto: CreateMenuOptionGroupDto) {
    // Verify menu and option group exist
    await this.verifyMenuExists(dto.menuId);
    await this.findOptionGroupById(dto.optionGroupId);

    // Check if this combination already exists
    const existingMenuOptionGroup = await this.menuOptionGroupRepository.findOne({
      where: { 
        menuId: dto.menuId, 
        optionGroupId: dto.optionGroupId 
      },
    });

    if (existingMenuOptionGroup) {
      throw new BadRequestException('This option group is already associated with the menu');
    }

    const menuOptionGroup = this.menuOptionGroupRepository.create(dto);
    return this.menuOptionGroupRepository.save(menuOptionGroup);
  }

  async updateMenuOptionGroup(id: number, dto: UpdateMenuOptionGroupDto) {
    const menuOptionGroup = await this.menuOptionGroupRepository.findOne({
      where: { id },
    });

    if (!menuOptionGroup) {
      throw new NotFoundException(`Menu Option Group with ID ${id} not found`);
    }

    Object.assign(menuOptionGroup, dto);
    return this.menuOptionGroupRepository.save(menuOptionGroup);
  }

  async deleteMenuOptionGroup(id: number) {
    const menuOptionGroup = await this.menuOptionGroupRepository.findOne({
      where: { id },
    });

    if (!menuOptionGroup) {
      throw new NotFoundException(`Menu Option Group with ID ${id} not found`);
    }

    return this.menuOptionGroupRepository.remove(menuOptionGroup);
  }

  // Utility Methods
  private async verifyStoreExists(storeId: number) {
    const store = await this.storeRepository.findOne({
      where: { id: storeId },
    });

    if (!store) {
      throw new NotFoundException(`Store with ID ${storeId} not found`);
    }
  }

  private async verifyMenuExists(menuId: number) {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id: menuId },
    });

    if (!menuItem) {
      throw new NotFoundException(`Menu Item with ID ${menuId} not found`);
    }
  }
}