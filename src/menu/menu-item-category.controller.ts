import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Query, 
  Patch,
  UseGuards,
  ParseIntPipe,
  Request
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { MenuItemCategoryService } from './menu-item-category.service';
import { MenuItemService } from './menu-item.service';
import { CreateMenuItemCategoryDto, UpdateMenuItemCategoryDto, MenuItemCategoryQueryDto } from './dto/menu-item-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';

@ApiTags('메뉴 아이템-카테고리 관계')
@Controller('menu-item-categories')
export class MenuItemCategoryController {
  constructor(
    private readonly menuItemCategoryService: MenuItemCategoryService,
    private readonly menuItemService: MenuItemService,
  ) {}

  @Get(':storeId')
  @ApiOperation({ summary: '메뉴 아이템-카테고리 관계 목록 조회' })
  @ApiResponse({ status: 200, description: '메뉴 아이템-카테고리 관계 목록을 반환합니다.' })
  findAll(
    @Param('storeId') storeId: number | string,
    @Query() query: MenuItemCategoryQueryDto
  ) {
    if (query.type === 'domain') {
        return this.menuItemCategoryService.findAll(query);
    }
    return this.menuItemCategoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '메뉴 아이템-카테고리 관계 상세 조회' })
  @ApiResponse({ status: 200, description: '메뉴 아이템-카테고리 관계 상세 정보를 반환합니다.' })
  @ApiResponse({ status: 404, description: '메뉴 아이템-카테고리 관계를 찾을 수 없습니다.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemCategoryService.findOne(id);
  }

  @Get('menu-item/:menuItemId')
  @ApiOperation({ summary: '메뉴 아이템별 카테고리 목록 조회' })
  @ApiResponse({ status: 200, description: '메뉴 아이템별 카테고리 목록을 반환합니다.' })
  findByMenuItemId(@Param('menuItemId', ParseIntPipe) menuItemId: number) {
    return this.menuItemCategoryService.findByMenuItemId(menuItemId);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: '조회카테고리별 메뉴 아이템 목록 ' })
  @ApiResponse({ status: 200, description: '카테고리별 메뉴 아이템 목록을 반환합니다.' })
  findByCategoryId(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.menuItemCategoryService.findByCategoryId(categoryId);
  }

  @Post()
  @ApiOperation({ summary: '메뉴 아이템-카테고리 관계 생성' })
  @ApiResponse({ status: 201, description: '메뉴 아이템-카테고리 관계가 생성되었습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  async create(
    @Body() createMenuItemCategoryDto: CreateMenuItemCategoryDto,
    @Request() req
  ) {
    const menuItem = await this.menuItemService.findOne(createMenuItemCategoryDto.menuItemId);
    await this.menuItemService.verifyStoreOwnership(menuItem.storeId, req.user.ownerId);
    return this.menuItemCategoryService.create(createMenuItemCategoryDto);
  }

  @Patch(':id')
  @ApiOperation({ summary: '메뉴 아이템-카테고리 관계 수정' })
  @ApiResponse({ status: 200, description: '메뉴 아이템-카테고리 관계가 수정되었습니다.' })
  @ApiResponse({ status: 404, description: '메뉴 아이템-카테고리 관계를 찾을 수 없습니다.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuItemCategoryDto: UpdateMenuItemCategoryDto,
    @Request() req
  ) {
    await this.menuItemCategoryService.verifyStoreOwnership(id, req.user.ownerId);
    return this.menuItemCategoryService.update(id, updateMenuItemCategoryDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: '메뉴 아이템-카테고리 관계 삭제' })
  @ApiResponse({ status: 200, description: '메뉴 아이템-카테고리 관계가 삭제되었습니다.' })
  @ApiResponse({ status: 404, description: '메뉴 아이템-카테고리 관계를 찾을 수 없습니다.' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    await this.menuItemCategoryService.verifyStoreOwnership(id, req.user.ownerId);
    return this.menuItemCategoryService.remove(id);
  }
} 