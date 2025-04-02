import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsNumber, IsOptional, IsBoolean } from 'class-validator';

export class CreateCategoryDto {
  @ApiProperty({ example: '카페', description: '카테고리 이름' })
  @IsNotEmpty({ message: '카테고리 이름은 필수입니다.' })
  @IsString()
  name: string;

  @ApiProperty({ example: '커피, 디저트 등을 판매하는 매장', description: '카테고리 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'cafe_icon.png', description: '카테고리 아이콘', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 1, description: '표시 순서', required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiProperty({ example: true, description: '활성화 여부', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class UpdateCategoryDto {
  @ApiProperty({ example: '카페', description: '카테고리 이름', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '커피, 디저트 등을 판매하는 매장', description: '카테고리 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'cafe_icon.png', description: '카테고리 아이콘', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ example: 1, description: '표시 순서', required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @ApiProperty({ example: true, description: '활성화 여부', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
