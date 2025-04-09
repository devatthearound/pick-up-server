import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsNumber, 
  IsOptional, 
  IsBoolean, 
  Min, 
  Max, 
  ValidateNested 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateOptionGroupDto {
  @ApiProperty({ description: '옵션 그룹 이름' })
  @IsNotEmpty({ message: '옵션 그룹 이름은 필수입니다.' })
  @IsString()
  name: string;

  @ApiProperty({ example: '음료 사이즈 선택', description: '옵션 그룹 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: '필수 여부' })
  @IsOptional()
  @IsBoolean()
  isRequired: boolean;

  @ApiProperty({ description: '최소 선택 개수' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSelections: number;

  @ApiProperty({ description: '최대 선택 개수' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSelections: number;

  @ApiPropertyOptional({ description: '표시 순서', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class UpdateOptionGroupDto {
  @ApiPropertyOptional({ description: '옵션 그룹 이름' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '음료 사이즈 선택', description: '옵션 그룹 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: '필수 여부' })
  @IsOptional()
  @IsBoolean()
  isRequired?: boolean;

  @ApiPropertyOptional({ description: '최소 선택 개수' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minSelections?: number;

  @ApiPropertyOptional({ description: '최대 선택 개수' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  maxSelections?: number;

  @ApiPropertyOptional({ description: '표시 순서' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class CreateOptionItemDto {
  @ApiProperty({ description: '옵션 항목 이름' })
  @IsNotEmpty({ message: '옵션 아이템 이름은 필수입니다.' })
  @IsString()
  name: string;

  @ApiProperty({ description: '가격' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: true, description: '옵션 가용 상태', required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: '표시 순서', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class UpdateOptionItemDto {
  @ApiPropertyOptional({ description: '옵션 항목 이름' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: '가격' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: true, description: '옵션 가용 상태', required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiPropertyOptional({ description: '표시 순서' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class CreateMenuOptionGroupDto {
  @ApiProperty({ description: '메뉴 ID' })
  @IsNotEmpty()
  @IsNumber()
  menuId: number;

  @ApiProperty({ description: '옵션 그룹 ID' })
  @IsNotEmpty()
  @IsNumber()
  optionGroupId: number;

  @ApiPropertyOptional({ description: '표시 순서', default: 0 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class UpdateMenuOptionGroupDto {
  @ApiPropertyOptional({ description: '표시 순서' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  displayOrder?: number;
}

export class OptionGroupQueryDto {
  @ApiPropertyOptional({ description: '페이지 번호', default: 1 })
  page?: number;

  @ApiPropertyOptional({ description: '페이지당 항목 수', default: 10 })
  limit?: number;

  @ApiPropertyOptional({ description: '매장 ID 필터' })
  storeId?: number;

  @ApiPropertyOptional({ description: '필수 여부 필터' })
  isRequired?: boolean;
}