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
import { StoreBenefitService } from './store-benefit.service';
import { 
  CreateStoreBenefitDto, 
  UpdateStoreBenefitDto, 
  StoreBenefitQueryDto 
} from './dto/store-benefit.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Store } from './entities/store.entity';
import { Repository } from 'typeorm';

@ApiTags('매장 혜택')
@Controller('stores')
export class StoreBenefitController {
  constructor(
    private readonly storeBenefitService: StoreBenefitService,
    @InjectRepository(Store)
    private readonly storeRepository: Repository<Store>,
  ) {}

  // 매장 혜택 목록 조회
  @ApiOperation({ summary: '매장 혜택 목록 조회' })
  @ApiResponse({ status: 200, description: '매장 혜택 목록 반환' })
  @Get(':storeId/benefits')
  async findByStoreId(
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query() query?: StoreBenefitQueryDto
  ) {
    return this.storeBenefitService.findByStoreId(storeId, query || {});
  }

  // 현재 진행 중인 혜택 조회
  @ApiOperation({ summary: '현재 진행 중인 매장 혜택 조회' })
  @ApiResponse({ status: 200, description: '현재 진행 중인 혜택 목록 반환' })
  @Get(':storeId/benefits/ongoing')
  async findOngoingBenefits(
    @Param('storeId', ParseIntPipe) storeId: number
  ) {
    return this.storeBenefitService.findOngoingBenefits(storeId);
  }

  // 특정 혜택 상세 조회
  @ApiOperation({ summary: '매장 혜택 상세 조회' })
  @ApiResponse({ status: 200, description: '매장 혜택 상세 정보 반환' })
  @Get('benefits/:id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storeBenefitService.findOne(id);
  }

  // 매장 혜택 생성 (점주 전용)
  @ApiOperation({ summary: '매장 혜택 생성' })
  @ApiResponse({ status: 201, description: '매장 혜택 생성 성공' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post(':storeId/benefits')
  async create(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() createDto: CreateStoreBenefitDto
  ) {
    // 매장 소유권 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    return this.storeBenefitService.create(storeId, createDto);
  }

  // 매장 혜택 수정 (점주 전용)
  @ApiOperation({ summary: '매장 혜택 수정' })
  @ApiResponse({ status: 200, description: '매장 혜택 수정 성공' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch('benefits/:id')
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDto: UpdateStoreBenefitDto
  ) {
    // 혜택 소유권 확인
    await this.validateBenefitOwnership(req.user.ownerId, id);
    
    return this.storeBenefitService.update(id, updateDto);
  }

  // 매장 혜택 삭제 (점주 전용)
  @ApiOperation({ summary: '매장 혜택 삭제' })
  @ApiResponse({ status: 200, description: '매장 혜택 삭제 성공' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete('benefits/:id')
  async remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number
  ) {
    // 혜택 소유권 확인
    await this.validateBenefitOwnership(req.user.ownerId, id);
    
    return this.storeBenefitService.remove(id);
  }

  // 매장의 모든 혜택 삭제 (점주 전용)
  @ApiOperation({ summary: '매장의 모든 혜택 삭제' })
  @ApiResponse({ status: 200, description: '매장 혜택 모두 삭제 성공' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':storeId/benefits')
  async removeAll(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number
  ) {
    // 매장 소유권 확인
    await this.validateStoreOwnership(req.user.ownerId, storeId);
    
    return this.storeBenefitService.removeAllByStoreId(storeId);
  }

  // 매장 소유권 검증 메서드
  private async validateStoreOwnership(userId: number, storeId: number): Promise<void> {
    const store = await this.storeRepository.findOne({
      where: { 
        id: storeId, 
        ownerId: userId 
      },
    });

    if (!store) {
      throw new ForbiddenException('해당 매장에 대한 권한이 없습니다.');
    }
  }

  // 혜택 소유권 검증 메서드
  private async validateBenefitOwnership(userId: number, benefitId: number): Promise<void> {
    const benefit = await this.storeBenefitService.findOne(benefitId);

    const store = await this.storeRepository.findOne({
      where: { 
        id: benefit.storeId, 
        ownerId: userId 
      },
    });

    if (!store) {
      throw new ForbiddenException('해당 혜택에 대한 권한이 없습니다.');
    }
  }
}