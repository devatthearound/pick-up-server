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
import { MenuCategoryService } from './menu-category.service';
import { CreateMenuCategoryDto, UpdateMenuCategoryDto, MenuCategoryQueryDto } from './dto/menu-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';

@ApiTags('메뉴 카테고리')
@Controller('menu-categories')
export class MenuCategoryController {
  constructor(private readonly menuCategoryService: MenuCategoryService) {}

  @Get()
  @ApiOperation({ summary: '메뉴 카테고리 목록 조회' })
  @ApiResponse({ status: 200, description: '메뉴 카테고리 목록을 반환합니다.' })
  findAll(@Query() query: MenuCategoryQueryDto) {
    return this.menuCategoryService.findAll(query);
  }

  @Get(':id')
  @ApiOperation({ summary: '메뉴 카테고리 상세 조회' })
  @ApiResponse({ status: 200, description: '메뉴 카테고리 상세 정보를 반환합니다.' })
  @ApiResponse({ status: 404, description: '메뉴 카테고리를 찾을 수 없습니다.' })
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuCategoryService.findOne(id);
  }

  @Get('store/:storeId')
  @ApiOperation({ summary: '매장별 메뉴 카테고리 조회' })
  @ApiResponse({ status: 200, description: '매장별 메뉴 카테고리 목록을 반환합니다.' })
  findByStoreId(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.menuCategoryService.findByStoreId(storeId);
  }

  @Post('store/:storeId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '메뉴 카테고리 생성' })
  @ApiResponse({ status: 201, description: '메뉴 카테고리가 생성되었습니다.' })
  @ApiResponse({ status: 403, description: '해당 매장에 대한 권한이 없습니다.' })
  async create(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() createMenuCategoryDto: CreateMenuCategoryDto,
    @Request() req
  ) {
    // 매장 소유 확인 로직 추가
    await this.menuCategoryService.verifyStoreOwnership(storeId, req.user['id']);
    return this.menuCategoryService.create(storeId, createMenuCategoryDto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '메뉴 카테고리 수정' })
  @ApiResponse({ status: 200, description: '메뉴 카테고리가 수정되었습니다.' })
  @ApiResponse({ status: 403, description: '해당 카테고리에 대한 권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '메뉴 카테고리를 찾을 수 없습니다.' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateMenuCategoryDto: UpdateMenuCategoryDto,
    @Request() req
  ) {
    // 카테고리의 매장 소유 확인
    const category = await this.menuCategoryService.findOne(id);
    await this.menuCategoryService.verifyStoreOwnership(category.storeId, req.user.id);
    return this.menuCategoryService.update(id, updateMenuCategoryDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @ApiBearerAuth()
  @ApiOperation({ summary: '메뉴 카테고리 삭제' })
  @ApiResponse({ status: 200, description: '메뉴 카테고리가 삭제되었습니다.' })
  @ApiResponse({ status: 403, description: '해당 카테고리에 대한 권한이 없습니다.' })
  @ApiResponse({ status: 404, description: '메뉴 카테고리를 찾을 수 없습니다.' })
  async remove(
    @Param('id', ParseIntPipe) id: number,
    @Request() req
  ) {
    // 카테고리의 매장 소유 확인
    const category = await this.menuCategoryService.findOne(id);
    await this.menuCategoryService.verifyStoreOwnership(category.storeId, req.user.id);
    return this.menuCategoryService.remove(id);
  }
}
