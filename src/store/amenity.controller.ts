import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Request, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { AmenityService } from './amenity.service';
import { CreateAmenityDto, UpdateAmenityDto, StoreAmenityDto } from './dto/amenity.dto';
import { StoreService } from './store.service';

@ApiTags('부가서비스')
@Controller()
export class AmenityController {
  constructor(
    private readonly amenityService: AmenityService,
    private readonly storeService: StoreService,
  ) {}

  // 부가서비스 관리 API (관리자 전용)
  @ApiOperation({ summary: '모든 부가서비스 목록 조회' })
  @ApiResponse({ status: 200, description: '부가서비스 목록 반환' })
  @Get('amenities')
  async findAll() {
    return this.amenityService.findAll();
  }

  @ApiOperation({ summary: '부가서비스 상세 조회' })
  @ApiResponse({ status: 200, description: '부가서비스 정보 반환' })
  @ApiResponse({ status: 404, description: '부가서비스를 찾을 수 없음' })
  @Get('amenities/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.amenityService.findOne(id);
  }

  @ApiOperation({ summary: '부가서비스 생성 (관리자 전용)' })
  @ApiResponse({ status: 201, description: '부가서비스 생성 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER) // 향후 ADMIN 역할로 변경 필요
  @Post('amenities')
  async create(@Body() createAmenityDto: CreateAmenityDto) {
    return this.amenityService.create(createAmenityDto);
  }

  @ApiOperation({ summary: '부가서비스 수정 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '부가서비스 수정 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '부가서비스를 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER) // 향후 ADMIN 역할로 변경 필요
  @Patch('amenities/:id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateAmenityDto: UpdateAmenityDto,
  ) {
    return this.amenityService.update(id, updateAmenityDto);
  }

  @ApiOperation({ summary: '부가서비스 삭제 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '부가서비스 삭제 성공' })
  @ApiResponse({ status: 400, description: '삭제할 수 없는 부가서비스' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '부가서비스를 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER) // 향후 ADMIN 역할로 변경 필요
  @Delete('amenities/:id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.amenityService.remove(id);
  }

  // 매장별 부가서비스 관리 API
  @ApiOperation({ summary: '매장 부가서비스 목록 조회' })
  @ApiResponse({ status: 200, description: '매장 부가서비스 목록 반환' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @Get('stores/:storeId/amenities')
  async findByStoreId(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.amenityService.findByStoreId(storeId);
  }

  @ApiOperation({ summary: '매장 부가서비스 설정 (기존 모두 삭제 후 새로 설정)' })
  @ApiResponse({ status: 200, description: '매장 부가서비스 설정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장 또는 부가서비스를 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post('stores/:storeId/amenities')
  async setStoreAmenities(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() storeAmenityDto: StoreAmenityDto,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.id, storeId);
    
    return this.amenityService.setStoreAmenities(storeId, storeAmenityDto);
  }

  @ApiOperation({ summary: '매장 부가서비스 추가 (기존 유지)' })
  @ApiResponse({ status: 200, description: '매장 부가서비스 추가 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장 또는 부가서비스를 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch('stores/:storeId/amenities/add')
  async addStoreAmenities(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() storeAmenityDto: StoreAmenityDto,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.id, storeId);
    
    return this.amenityService.addStoreAmenities(storeId, storeAmenityDto);
  }

  @ApiOperation({ summary: '매장 부가서비스 삭제' })
  @ApiResponse({ status: 200, description: '매장 부가서비스 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete('stores/:storeId/amenities')
  async removeStoreAmenities(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() storeAmenityDto: StoreAmenityDto,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.id, storeId);
    
    return this.amenityService.removeStoreAmenities(storeId, storeAmenityDto);
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