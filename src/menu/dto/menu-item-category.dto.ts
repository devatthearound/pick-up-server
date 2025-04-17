import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

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
  @ApiProperty({ required: false, description: '메뉴 아이템 ID로 필터링' })
  @IsOptional()
  @IsNumber()
  menuItemId?: number;

  @ApiProperty({ required: false, description: '카테고리 ID로 필터링' })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ required: false, description: '타입으로 필터링' })
  @IsOptional()
  @IsString()
  type?: string;
} 