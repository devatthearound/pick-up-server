import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request, ParseIntPipe, NotFoundException, ForbiddenException, UploadedFile, UseInterceptors, UploadedFiles, BadRequestException } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiConsumes } from '@nestjs/swagger';
import { StoreService } from './store.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { StoreQueryDto } from './dto/store-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/dto/register.dto';
import { FileInterceptor, FileFieldsInterceptor } from '@nestjs/platform-express';
import { Express } from 'express';
import { Multer } from 'multer';

@ApiTags('상점')
@Controller('stores')
export class StoreController {
  constructor(private readonly storeService: StoreService) {}

  @ApiOperation({ summary: '상점 목록 조회' })
  @ApiResponse({ status: 200, description: '상점 목록 반환' })
  @Get()
  async findAll(@Query() query: StoreQueryDto) {
    return this.storeService.findAll(query);
  }

  @ApiOperation({ summary: '상점 상세 조회' })
  @ApiResponse({ status: 200, description: '상점 정보 반환' })
  @ApiResponse({ status: 404, description: '상점을 찾을 수 없음' })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.storeService.findOne(id);
  }

  @ApiOperation({ summary: '내 상점 목록 조회' })
  @ApiResponse({ status: 200, description: '내 상점 목록 반환' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Get('owner/my-stores')
  async getMyStores(@Request() req) {
    const ownerId = req.user.ownerId;
    return this.storeService.getStoresByOwnerId(ownerId);
  }

  @ApiOperation({ summary: '상점 등록' })
  @ApiResponse({ status: 201, description: '상점 등록 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 409, description: '사업자 등록 번호 중복' })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'businessRegistrationFile', maxCount: 1 },
      { name: 'logoImage', maxCount: 1 },
      { name: 'bannerImage', maxCount: 1 }
    ])
  )
  async create(
    @Request() req,
    @Body('data') data: string,
    @UploadedFiles() files: {
      businessRegistrationFile?: Express.Multer.File[];
      logoImage?: Express.Multer.File[];
      bannerImage?: Express.Multer.File[];
    }
  ) {
    const createStoreDto = JSON.parse(data) as CreateStoreDto;
    const ownerId = req.user.ownerId;
    
    return this.storeService.create(ownerId, createStoreDto, {
      businessRegistrationFile: files.businessRegistrationFile?.[0],
      logoImage: files.logoImage?.[0],
      bannerImage: files.bannerImage?.[0]
    });
  }

  @ApiOperation({ summary: '상점 정보 수정' })
  @ApiResponse({ status: 200, description: '상점 수정 성공' })
  @ApiResponse({ status: 400, description: '잘못된 요청' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '상점을 찾을 수 없음' })
  @ApiResponse({ status: 409, description: '사업자 등록 번호 중복' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'logoImage', maxCount: 1 },
      { name: 'bannerImage', maxCount: 1 }
    ])
  )
  async update(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('data') data: string,
    @UploadedFiles() files: {
      logoImage?: Express.Multer.File[];
      bannerImage?: Express.Multer.File[];
    }
  ) {
    console.log('업로드된 파일 정보:', {
      logoImage: files.logoImage?.[0] ? {
        originalname: files.logoImage[0].originalname,
        mimetype: files.logoImage[0].mimetype,
        size: files.logoImage[0].size,
        buffer: files.logoImage[0].buffer?.length,
        fieldname: files.logoImage[0].fieldname
      } : null,
      bannerImage: files.bannerImage?.[0] ? {
        originalname: files.bannerImage[0].originalname,
        mimetype: files.bannerImage[0].mimetype,
        size: files.bannerImage[0].size,
        buffer: files.bannerImage[0].buffer?.length,
        fieldname: files.bannerImage[0].fieldname
      } : null
    });
    
    const updateStoreDto = JSON.parse(data) as UpdateStoreDto;
    const ownerId = req.user.ownerId;

    return this.storeService.update(id, ownerId, updateStoreDto, {
      logoImage: files.logoImage?.[0],
      bannerImage: files.bannerImage?.[0]
    });
  }

  @ApiOperation({ summary: '상점 삭제' })
  @ApiResponse({ status: 200, description: '상점 삭제 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '상점을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.OWNER)
  @Delete(':id')
  async remove(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const ownerId = req.user.ownerId;
    return this.storeService.remove(id, ownerId);
  }

  @ApiOperation({ summary: '상점 인증 상태 변경 (관리자 전용)' })
  @ApiResponse({ status: 200, description: '인증 상태 변경 성공' })
  @ApiResponse({ status: 401, description: '인증되지 않은 요청' })
  @ApiResponse({ status: 403, description: '권한 없음' })
  @ApiResponse({ status: 404, description: '상점을 찾을 수 없음' })
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Patch(':id/verify')
  async verifyStore(
    @Request() req,
    @Param('id', ParseIntPipe) id: number,
    @Body('isVerified') isVerified: boolean,
  ) {
    // 관리자 역할 체크 (향후 ADMIN 역할 추가 필요)
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('관리자만 접근할 수 있습니다.');
    }
    
    return this.storeService.verifyStore(id, isVerified);
  }
}