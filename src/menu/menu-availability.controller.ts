import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Delete, 
  Patch, 
  UseGuards, 
  Query, 
  ParseIntPipe,
  Request,
  BadRequestException,
  ForbiddenException
} from '@nestjs/common';
import { 
  ApiBearerAuth, 
  ApiOperation, 
  ApiResponse, 
  ApiTags 
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { MenuAvailabilityService } from './menu-availability.service';
import { 
  CreateMenuAvailabilityDto, 
  UpdateMenuAvailabilityDto, 
  MenuAvailabilityQueryDto 
} from './dto/menu-availability.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { MenuItem } from '../menu/entities/menu-item.entity';
import { Repository } from 'typeorm';
import { Store } from '../store/entities/store.entity';

@ApiTags('메뉴 가용성')
@Controller('menu-items')
export class MenuAvailabilityController {
  constructor(
    private readonly menuAvailabilityService: MenuAvailabilityService,
    @InjectRepository(MenuItem)
    private readonly menuItemRepository: Repository<MenuItem>,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  // 메뉴 가용성 목록 조회
  @ApiOperation({ summary: '메뉴 가용성 목록 조회' })
  @ApiResponse({ status: 200, description: '메뉴 가용성 목록 반환' })
  @ApiResponse({ status: 404, description: '메뉴를 찾을 수 없음' })
  @Get(':menuId/availability')
  async findByMenuId(
    @Param('menuId', ParseIntPipe) menuId: number,
    @Query() query?: MenuAvailabilityQueryDto
  ) {
    return this.menuAvailabilityService.findByMenuId(menuId, query);
  }

  // 특정 가용성 항목 상세 조회
  @ApiOperation({ summary: '메뉴 가용성 상세 조회' })
  @ApiResponse({ status: 200, description: '메뉴 가용성 상세 정보 반환' })
  @ApiResponse({ status: 404, description: '메뉴 가용성을 찾을 수 없음' })
  @Get('availability/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.menuAvailabilityService.findOne(id);
  }

  // 메뉴 가용성 생성
  @ApiOperation({ summary: '메뉴 가용성 생성' })
  @ApiResponse({ status: 201, description: '메뉴 가용성 생성 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '메뉴를 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post(':menuId/availability')
  async create(
    @Request() req,
    @Param('menuId', ParseIntPipe) menuId: number,
    @Body() createDto: CreateMenuAvailabilityDto
  ) {
    // 메뉴 소유권 확인
    await this.validateMenuOwnership(req.user.id, menuId);
    
    return this.menuAvailabilityService.create(menuId, createDto);
  }

  // 메뉴 가용성 수정
  @ApiOperation({ summary: '메뉴 가용성 수정' })
  @ApiResponse({ status: 200, description: '메뉴 가용성 수정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '메뉴 가용성을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch('availability/:id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateMenuAvailabilityDto
  ) {
    // 메뉴 소유권 확인
    await this.validateAvailabilityOwnership(req.user.id, id);
    
    return this.menuAvailabilityService.update(id, updateDto);
  }

  // 개별 메뉴 가용성 삭제
  @ApiOperation({ summary: '메뉴 가용성 삭제' })
  @ApiResponse({ status: 200, description: '메뉴 가용성 삭제 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '메뉴 가용성을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete('availability/:id')
  async remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    // 메뉴 소유권 확인
    await this.validateAvailabilityOwnership(req.user.id, id);
    
    return this.menuAvailabilityService.remove(id);
  }

  // 메뉴의 모든 가용성 삭제
  @ApiOperation({ summary: '메뉴의 모든 가용성 삭제' })
  @ApiResponse({ status: 200, description: '메뉴 가용성 모두 삭제 성공' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '메뉴를 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':menuId/availability')
  async removeAll(
    @Request() req,
    @Param('menuId', ParseIntPipe) menuId: number
  ) {
    // 메뉴 소유권 확인
    await this.validateMenuOwnership(req.user.id, menuId);
    
    return this.menuAvailabilityService.removeAllByMenuId(menuId);
  }

  // 메뉴 소유권 검증 메서드
  private async validateMenuOwnership(userId: number, menuId: number): Promise<void> {
    const menuItem = await this.menuItemRepository.findOne({
      where: { id: menuId },
      relations: ['store'],
    });

    if (!menuItem) {
      throw new BadRequestException('메뉴를 찾을 수 없습니다.');
    }

    const store = await this.storeRepository.findOne({
      where: { 
        id: menuItem.store.id, 
        ownerId: userId 
      },
    });

    if (!store) {
      throw new ForbiddenException('해당 메뉴에 대한 권한이 없습니다.');
    }
  }

  // 가용성 항목 소유권 검증 메서드
  private async validateAvailabilityOwnership(userId: number, availabilityId: number): Promise<void> {
    const availability = await this.menuAvailabilityService.findOne(availabilityId);

    const menuItem = await this.menuItemRepository.findOne({
      where: { id: availability.menuId },
      relations: ['store'],
    });

    if (!menuItem) {
      throw new BadRequestException('메뉴를 찾을 수 없습니다.');
    }

    const store = await this.storeRepository.findOne({
      where: { 
        id: menuItem.store.id, 
        ownerId: userId 
      },
    });

    if (!store) {
      throw new ForbiddenException('해당 메뉴 가용성에 대한 권한이 없습니다.');
    }
  }
}