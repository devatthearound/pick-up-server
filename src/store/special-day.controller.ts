import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, Request, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { SpecialDaysService } from './special-day.service';
import { CreateSpecialDayDto, UpdateSpecialDayDto, SpecialDayQueryDto } from './dto/special-day.dto';
import { StoreService } from './store.service';

@ApiTags('매장 특별 영업일/휴무일')
@Controller('stores')
export class SpecialDaysController {
  constructor(
    private readonly specialDaysService: SpecialDaysService,
    private readonly storeService: StoreService,
  ) {}

  @ApiOperation({ summary: '매장 특별 영업일/휴무일 목록 조회' })
  @ApiResponse({ status: 200, description: '특별 영업일/휴무일 목록 반환' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiParam({ name: 'storeId', type: 'number', description: '매장 ID' })
  @Get(':storeId/special-days')
  async findAll(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query() query: SpecialDayQueryDto,
  ) {
    return this.specialDaysService.findAllByStoreId(storeId, query);
  }

  @ApiOperation({ summary: '매장 특별 영업일/휴무일 상세 조회' })
  @ApiResponse({ status: 200, description: '특별 영업일/휴무일 정보 반환' })
  @ApiResponse({ status: 404, description: '특별 영업일/휴무일을 찾을 수 없음' })
  @ApiParam({ name: 'storeId', type: 'number', description: '매장 ID' })
  @ApiParam({ name: 'id', type: 'number', description: '특별 영업일/휴무일 ID' })
  @Get(':storeId/special-days/:id')
  async findOne(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const specialDay = await this.specialDaysService.findOne(id);
    
    // 해당 특별 영업일/휴무일이 지정된 매장에 소속되어 있는지 확인
    if (specialDay.storeId !== storeId) {
      throw new BadRequestException('This special day does not belong to the specified store');
    }
    
    return specialDay;
  }

  @ApiOperation({ summary: '매장 특별 영업일/휴무일 등록' })
  @ApiResponse({ status: 201, description: '특별 영업일/휴무일 등록 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 존재하는 날짜의 특별 영업일/휴무일' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post(':storeId/special-days')
  async create(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() createSpecialDayDto: CreateSpecialDayDto,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    return this.specialDaysService.create(storeId, createSpecialDayDto);
  }

  @ApiOperation({ summary: '매장 특별 영업일/휴무일 수정' })
  @ApiResponse({ status: 200, description: '특별 영업일/휴무일 수정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '특별 영업일/휴무일을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':storeId/special-days/:id')
  async update(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSpecialDayDto: UpdateSpecialDayDto,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    // 해당 특별 영업일/휴무일이 지정된 매장에 소속되어 있는지 확인
    const specialDay = await this.specialDaysService.findOne(id);
    if (specialDay.storeId !== storeId) {
      throw new BadRequestException('This special day does not belong to the specified store');
    }
    
    return this.specialDaysService.update(id, updateSpecialDayDto);
  }

  @ApiOperation({ summary: '매장 특별 영업일/휴무일 삭제' })
  @ApiResponse({ status: 200, description: '특별 영업일/휴무일 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '특별 영업일/휴무일을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':storeId/special-days/:id')
  async remove(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    // 해당 특별 영업일/휴무일이 지정된 매장에 소속되어 있는지 확인
    const specialDay = await this.specialDaysService.findOne(id);
    if (specialDay.storeId !== storeId) {
      throw new BadRequestException('This special day does not belong to the specified store');
    }
    
    return this.specialDaysService.remove(id);
  }

  @ApiOperation({ summary: '매장 특별 영업일/휴무일 범위 삭제' })
  @ApiResponse({ status: 200, description: '특별 영업일/휴무일 범위 삭제 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':storeId/special-days/range')
  async removeByDateRange(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    // 날짜 형식 검증
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate) || !dateRegex.test(endDate)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD format.');
    }
    
    // 날짜 범위 검증
    if (startDate > endDate) {
      throw new BadRequestException('Start date must be before or equal to end date');
    }
    
    return this.specialDaysService.removeByDateRange(storeId, startDate, endDate);
  }

  @ApiOperation({ summary: '매장 특별 영업일/휴무일 모두 삭제' })
  @ApiResponse({ status: 200, description: '특별 영업일/휴무일 모두 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':storeId/special-days')
  async removeAll(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    return this.specialDaysService.removeAllByStoreId(storeId);
  }

  // 매장 소유권 확인 헬퍼 메서드
  private async validateStoreOwnership(userId: number, storeId: number) {
    const store = await this.storeService.findOne(storeId);
    
    if (store.ownerId !== userId) {
      throw new BadRequestException('You do not have permission to manage this store');
    }
    
    return true;
  }
}