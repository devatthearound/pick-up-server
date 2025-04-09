import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query, Request, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { OperatingHoursService } from './operating-hour.service';
import { CreateOperatingHourDto, UpdateOperatingHourDto, OperatingHoursResponseDto } from './dto/operating-hours.dto';
import { DayOfWeek } from './entities/store-operating-hour.entity';
import { StoreService } from './store.service';

@ApiTags('매장 영업시간')
@Controller('stores')
export class OperatingHoursController {
  constructor(
    private readonly operatingHoursService: OperatingHoursService,
    private readonly storeService: StoreService,
  ) {}

  @ApiOperation({ summary: '매장 영업시간 목록 조회' })
  @ApiResponse({ status: 200, description: '영업시간 목록 반환', type: OperatingHoursResponseDto })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiParam({ name: 'storeId', type: 'number', description: '매장 ID' })
  @Get(':storeId/operating-hours')
  async findAll(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.operatingHoursService.findAllByStoreId(storeId);
  }

  @ApiOperation({ summary: '매장 특정 요일 영업시간 조회' })
  @ApiResponse({ status: 200, description: '영업시간 정보 반환' })
  @ApiResponse({ status: 404, description: '매장 또는 영업시간을 찾을 수 없음' })
  @ApiParam({ name: 'storeId', type: 'number', description: '매장 ID' })
  @ApiParam({ name: 'day', enum: DayOfWeek, description: '요일' })
  @Get(':storeId/operating-hours/:day')
  async findByDay(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('day') day: DayOfWeek,
  ) {
    if (!Object.values(DayOfWeek).includes(day)) {
      throw new BadRequestException(`Invalid day: ${day}`);
    }
    
    return this.operatingHoursService.findByStoreIdAndDay(storeId, day);
  }

  @ApiOperation({ summary: '매장 영업시간 등록 (개별)' })
  @ApiResponse({ status: 201, description: '영업시간 등록 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 존재하는 요일 영업시간' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post(':storeId/operating-hours')
  async create(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() createOperatingHourDto: CreateOperatingHourDto,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    return this.operatingHoursService.create(storeId, createOperatingHourDto);
  }

  @ApiOperation({ summary: '매장 영업시간 일괄 등록' })
  @ApiResponse({ status: 201, description: '영업시간 일괄 등록 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '이미 존재하는 요일 영업시간' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post(':storeId/operating-hours/bulk')
  async createBulk(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() createOperatingHourDtos: CreateOperatingHourDto[],
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    return this.operatingHoursService.createBulk(storeId, createOperatingHourDtos);
  }

  @ApiOperation({ summary: '매장 영업시간 수정' })
  @ApiResponse({ status: 200, description: '영업시간 수정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '영업시간을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':storeId/operating-hours/:id')
  async update(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateOperatingHourDto: UpdateOperatingHourDto,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    // 해당 영업시간이 지정된 매장에 소속되어 있는지 확인
    const operatingHour = await this.operatingHoursService.findOne(id);
    if (operatingHour.storeId !== storeId) {
      throw new BadRequestException('This operating hour does not belong to the specified store');
    }
    
    return this.operatingHoursService.update(id, updateOperatingHourDto);
  }

  @ApiOperation({ summary: '매장 특정 요일 영업시간 수정' })
  @ApiResponse({ status: 200, description: '영업시간 수정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '영업시간을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':storeId/operating-hours/day/:day')
  async updateByDay(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('day') day: DayOfWeek,
    @Body() updateOperatingHourDto: UpdateOperatingHourDto,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    if (!Object.values(DayOfWeek).includes(day)) {
      throw new BadRequestException(`Invalid day: ${day}`);
    }
    
    return this.operatingHoursService.updateByDay(storeId, day, updateOperatingHourDto);
  }

  @ApiOperation({ summary: '매장 영업시간 삭제' })
  @ApiResponse({ status: 200, description: '영업시간 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '영업시간을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':storeId/operating-hours/:id')
  async remove(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('id', ParseIntPipe) id: number,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    // 해당 영업시간이 지정된 매장에 소속되어 있는지 확인
    const operatingHour = await this.operatingHoursService.findOne(id);
    if (operatingHour.storeId !== storeId) {
      throw new BadRequestException('This operating hour does not belong to the specified store');
    }
    
    return this.operatingHoursService.remove(id);
  }

  @ApiOperation({ summary: '매장 특정 요일 영업시간 삭제' })
  @ApiResponse({ status: 200, description: '영업시간 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '영업시간을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':storeId/operating-hours/day/:day')
  async removeByDay(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Param('day') day: DayOfWeek,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    if (!Object.values(DayOfWeek).includes(day)) {
      throw new BadRequestException(`Invalid day: ${day}`);
    }
    
    return this.operatingHoursService.removeByDay(storeId, day);
  }

  @ApiOperation({ summary: '매장 영업시간 모두 삭제' })
  @ApiResponse({ status: 200, description: '영업시간 모두 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':storeId/operating-hours')
  async removeAll(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    return this.operatingHoursService.removeAllByStoreId(storeId);
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