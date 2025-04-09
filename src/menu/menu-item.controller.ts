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
  Request,
  UseInterceptors,
  UploadedFile
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { MenuItemService } from './menu-item.service';
import { CreateMenuItemDto, UpdateMenuItemDto, MenuItemQueryDto } from './dto/menu-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { Transform, Type } from 'class-transformer';
@ApiTags('메뉴 아이템')
@Controller('menu-items')
export class MenuItemController {
  constructor(private readonly menuItemService: MenuItemService) {}

  @Get()
  @ApiOperation({ summary: '메뉴 아이템 목록 조회' })
  @ApiResponse({ status: 200, description: '메뉴 아이템 목록을 반환합니다.' })
  findAll(@Query() query: MenuItemQueryDto) {
    return this.menuItemService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '메뉴 아이템 상세 조회' })
  @ApiResponse({ status: 200, description: '메뉴 아이템 상세 정보를 반환합니다.' })
  @ApiResponse({ status: 404, description: '메뉴 아이템을 찾을 수 없습니다.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuItemService.findOne(id);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: '매장별 메뉴 아이템 조회' })
  @ApiResponse({ status: 200, description: '매장별 메뉴 아이템 목록을 반환합니다.' })
  findByStoreId(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.menuItemService.findByStoreId(storeId);
  }

  @Get('category/:categoryId')
  @ApiOperation({ summary: '카테고리별 메뉴 아이템 조회' })
  @ApiResponse({ status: 200, description: '카테고리별 메뉴 아이템 목록을 반환합니다.' })
  findByCategoryId(@Param('categoryId', ParseIntPipe) categoryId: number) {
    return this.menuItemService.findByCategoryId(categoryId);
  }

  @Get('popular/store/:storeId')
  @ApiOperation({ summary: '매장 인기 메뉴 조회' })
  @ApiResponse({ status: 200, description: '매장의 인기 메뉴를 반환합니다.' })
  findPopularItems(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('limit') limit?: number,
  ) {
    return this.menuItemService.findPopularItems(storeId, limit);
  }

  @Get('new/store/:storeId')
  @ApiOperation({ summary: '매장 신메뉴 조회' })
  @ApiResponse({ status: 200, description: '매장의 신메뉴를 반환합니다.' })
  findNewItems(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('limit') limit?: number,
  ) {
    return this.menuItemService.findNewItems(storeId, limit);
  }

  @Get('recommended/store/:storeId')
  @ApiOperation({ summary: '매장 추천 메뉴 조회' })
  @ApiResponse({ status: 200, description: '매장의 추천 메뉴를 반환합니다.' })
  findRecommendedItems(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('limit') limit?: number,
  ) {
    return this.menuItemService.findRecommendedItems(storeId, limit);
  }

  @Post('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: '메뉴 아이템 생성' })
  @ApiResponse({ status: 201, description: '메뉴 아이템이 생성되었습니다.' })
  @ApiResponse({ status: 403, description: '해당 매장에 대한 권한이 없습니다.' })
  async create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() createMenuItemDto: CreateMenuItemDto,
    @UploadedFile() image: Express.Multer.File,
    @Request() req
  ) {
    console.log("req.user", req.user);
    await this.menuItemService.verifyStoreOwnership(storeId, req.user.ownerId);
    return this.menuItemService.create(storeId, createMenuItemDto, image);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('image'))
  @ApiOperation({ summary: '메뉴 아이템 수정' })
  @ApiResponse({ status: 200, description: '메뉴 아이템이 수정되었습니다.' })
  @ApiResponse({ status: 403, description: '해당 메뉴에 대한 권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '메뉴 아이템을 찾을 수 없습니다.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuItemDto: UpdateMenuItemDto,
    @UploadedFile() image: Express.Multer.File,
    @Request() req
  ) {
    const menuItem = await this.menuItemService.findOne(id);
    await this.menuItemService.verifyStoreOwnership(menuItem.storeId, req.user.ownerId);
    return this.menuItemService.update(id, updateMenuItemDto, image);
  }

  @Patch(':id/stock')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '메뉴 아이템 재고 수정' })
  @ApiResponse({ status: 200, description: '메뉴 아이템 재고가 수정되었습니다.' })
  @ApiResponse({ status: 403, description: '해당 메뉴에 대한 권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '메뉴 아이템을 찾을 수 없습니다.' })
  async updateStock(
    @Param('id', ParseIntPipe) id: number,
    @Body('quantity', ParseIntPipe) quantity: number,
    @Request() req
  ) {
    // 메뉴 소유 확인
    const menuItem = await this.menuItemService.findOne(id);
    await this.menuItemService.verifyStoreOwnership(menuItem.storeId, req.user.ownerId);
    return this.menuItemService.updateStock(id, quantity);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '메뉴 아이템 삭제' })
  @ApiResponse({ status: 200, description: '메뉴 아이템이 삭제되었습니다.' })
  @ApiResponse({ status: 403, description: '해당 메뉴에 대한 권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '메뉴 아이템을 찾을 수 없습니다.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    // 메뉴 소유 확인
    const menuItem = await this.menuItemService.findOne(id);
    await this.menuItemService.verifyStoreOwnership(menuItem.storeId, req.user.ownerId);
    return this.menuItemService.remove(id);
  }
}
