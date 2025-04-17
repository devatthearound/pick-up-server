import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateMenuItemCategoryDto {
  @ApiProperty({ example: 1, description: '메뉴 아이템 ID' })
  @IsNotEmpty({ message: '메뉴 아이템 ID는 필수입니다.' })
  @IsNumber()
  menuItemId: number;

  @ApiProperty({ example: 1, description: '카테고리 ID' })
  @IsNotEmpty({ message: '카테고리 ID는 필수입니다.' })
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: 0, description: '표시 순서', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class UpdateMenuItemCategoryDto {
  @ApiProperty({ example: 0, description: '표시 순서', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class MenuItemCategoryQueryDto {
  @ApiProperty({ required: false, description: '페이지 번호' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  page?: number = 1;

  @ApiProperty({ required: false, description: '페이지당 항목 수' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  limit?: number = 10;

  @ApiProperty({ required: false, description: '매장 ID로 필터링' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  storeId?: number;

  @ApiProperty({ required: false, description: '메뉴 아이템 ID로 필터링' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  menuItemId?: number;

  @ApiProperty({ required: false, description: '카테고리 ID로 필터링' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ required: false, description: '타입으로 필터링' })
  @IsOptional()
  @IsString()
  type?: string;
} 