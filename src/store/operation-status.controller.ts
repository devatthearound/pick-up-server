import { Controller, Get, Post, Body, Param, UseGuards, Request, ParseIntPipe, BadRequestException, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { OperationStatusService } from './operation-status.service';
import { PauseOrdersDto, PauseHistoryQueryDto } from './dto/operation-status.dto';
import { StoreService } from './store.service';

@ApiTags('매장 운영 상태')
@Controller('stores')
export class OperationStatusController {
  constructor(
    private readonly operationStatusService: OperationStatusService,
    private readonly storeService: StoreService,
  ) {}

  @ApiOperation({ summary: '매장 운영 상태 조회' })
  @ApiResponse({ status: 200, description: '매장 운영 상태 반환' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @Get(':storeId/operation-status')
  async getOperationStatus(@Param('storeId', ParseIntPipe) storeId: number) {
    return this.operationStatusService.getOperationStatus(storeId);
  }

  @ApiOperation({ summary: '주문 일시 중지' })
  @ApiResponse({ status: 200, description: '주문 일시 중지 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post(':storeId/operation-status/pause')
  async pauseOrders(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Body() pauseOrdersDto: PauseOrdersDto,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.id, storeId);
    
    return this.operationStatusService.pauseOrders(storeId, pauseOrdersDto);
  }

  @ApiOperation({ summary: '주문 수신 재개' })
  @ApiResponse({ status: 200, description: '주문 수신 재개 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post(':storeId/operation-status/resume')
  async resumeOrders(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.id, storeId);
    
    return this.operationStatusService.resumeOrders(storeId);
  }

  @ApiOperation({ summary: '주문 일시 중지 이력 조회' })
  @ApiResponse({ status: 200, description: '주문 일시 중지 이력 반환' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '매장을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Get(':storeId/operation-status/history')
  async getPauseHistory(
    @Request() req,
    @Param('storeId', ParseIntPipe) storeId: number,
    @Query() query: PauseHistoryQueryDto,
  ) {
    // 권한 확인: 본인 소유의 매장인지 확인
    await this.validateStoreOwnership(req.user.id, storeId);
    
    return this.operationStatusService.getPauseHistory(storeId, query);
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