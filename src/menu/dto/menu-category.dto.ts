import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsBoolean } from 'class-validator';

export class CreateMenuCategoryDto {
  @ApiProperty({ example: '커피', description: '메뉴 카테고리 이름' })
  @IsNotEmpty({ message: '메뉴 카테고리 이름은 필수입니다.' })
  @IsString()
  name: string;

  @ApiProperty({ example: '다양한 커피 음료', description: '카테고리 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 1, description: '카테고리 표시 순서', required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiProperty({ example: true, description: '카테고리 활성 상태', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateMenuCategoryDto {
  @ApiProperty({ example: '에스프레소', description: '메뉴 카테고리 이름', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '진한 에스프레소 기반 음료', description: '카테고리 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 2, description: '카테고리 표시 순서', required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiProperty({ example: false, description: '카테고리 활성 상태', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class MenuCategoryQueryDto {
  @ApiProperty({ required: false, description: '페이지 번호' })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, description: '페이지당 항목 수' })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;

  @ApiProperty({ required: false, description: '활성 상태로 필터링' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ required: false, description: '매장 ID로 필터링' })
  @IsOptional()
  @IsNumber()
  storeId?: number;
}