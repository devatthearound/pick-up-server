import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString, IsBoolean, IsNumber, IsEnum } from 'class-validator';
import { Transform } from 'class-transformer';

export enum SortBy {
  CREATED_AT = 'createdAt',
  NAME = 'name',
  CATEGORY = 'categoryId',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class StoreQueryDto {
  @ApiProperty({ required: false, description: '페이지 번호' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  page?: number = 1;

  @ApiProperty({ required: false, description: '페이지당 항목 수' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number = 10;

  @ApiProperty({ required: false, description: '상점 이름 검색' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ required: false, description: '카테고리 ID로 필터링' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  categoryId?: number;

  @ApiProperty({ required: false, description: '점주 ID로 필터링' })
  @IsOptional()
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  ownerId?: number;

  @ApiProperty({ required: false, description: '활성 상태로 필터링' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;

  @ApiProperty({ required: false, description: '인증 상태로 필터링' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isVerified?: boolean;

  @ApiProperty({ required: false, enum: SortBy, description: '정렬 기준' })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CREATED_AT;

  @ApiProperty({ required: false, enum: SortOrder, description: '정렬 방향' })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;
}
