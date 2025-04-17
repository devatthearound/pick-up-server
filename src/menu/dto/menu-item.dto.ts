import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsNumber, 
  IsBoolean, 
  Min, 
  Max, 
  ValidateIf,
  IsDateString
} from 'class-validator';
import { Type } from 'class-transformer';
import { Transform } from 'class-transformer';

export class CreateMenuItemDto {
  @ApiProperty({ example: '아메리카노', description: '메뉴 이름' })
  @IsNotEmpty({ message: '메뉴 이름은 필수입니다.' })
  @IsString()
  name: string;

  @ApiProperty({ example: '진한 에스프레소에 물을 더한 음료', description: '메뉴 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 4000, description: '메뉴 가격' })
  @IsNotEmpty({ message: '가격은 필수입니다.' })
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: '가격은 0 이상이어야 합니다.' })
  price: number;

  @ApiProperty({ example: 3500, description: '할인된 가격', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: '할인 가격은 0 이상이어야 합니다.' })
  @ValidateIf((o) => o.discountedPrice !== undefined && o.price !== undefined && o.discountedPrice > o.price)
  discountedPrice?: number;

  @ApiProperty({ example: 1, description: '메뉴 카테고리 ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ 
    type: 'string', 
    description: '메뉴 이미지 파일', 
    required: false,
    format: 'binary' 
  })
  @IsOptional()
  image?: any;

  @ApiProperty({ example: 5, description: '준비 시간 (분)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  preparationTime?: number;

  @ApiProperty({ example: true, description: '인기 메뉴 여부', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPopular?: boolean;

  @ApiProperty({ example: true, description: '신메뉴 여부', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isNew?: boolean;

  @ApiProperty({ example: true, description: '추천 메뉴 여부', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isRecommended?: boolean;
}

export class UpdateMenuItemDto {
  @ApiProperty({ example: '아이스 아메리카노', description: '메뉴 이름', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '차가운 에스프레소에 물을 더한 음료', description: '메뉴 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 4500, description: '메뉴 가격', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: '가격은 0 이상이어야 합니다.' })
  price?: number;

  @ApiProperty({ example: 4000, description: '할인된 가격', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0, { message: '할인 가격은 0 이상이어야 합니다.' })
  @ValidateIf((o) => o.discountedPrice !== undefined && o.price !== undefined && o.discountedPrice > o.price)
  discountedPrice?: number;

  @ApiProperty({ example: 1, description: '메뉴 카테고리 ID', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ example: 'iced_coffee.jpg', description: '메뉴 이미지', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ example: 3, description: '준비 시간 (분)', required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  preparationTime?: number;

  @ApiProperty({ example: true, description: '판매 가능 여부', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: true, description: '인기 메뉴 여부', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isPopular?: boolean;

  @ApiProperty({ example: false, description: '신메뉴 여부', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isNew?: boolean;

  @ApiProperty({ example: true, description: '추천 메뉴 여부', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isRecommended?: boolean;

  @ApiProperty({ example: 30, description: '재고 수량', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  stockQuantity?: number;

  @ApiProperty({ 
    type: 'string', 
    description: '메뉴 이미지 파일', 
    required: false,
    format: 'binary' 
  })
  @IsOptional()
  image?: any;

  @ApiProperty({ example: true, description: '삭제 여부', required: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  isDeleted?: boolean;

  @ApiProperty({ example: '2024-01-01', description: '삭제 일자', required: false })
  @IsOptional()
  @IsDateString()
  deletedAt?: Date;
}

export class MenuItemQueryDto {
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

  @ApiProperty({ required: false, description: '카테고리 ID로 필터링' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  categoryId?: number;

  @ApiProperty({ required: false, description: '판매 가능 여부로 필터링' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isAvailable?: boolean;

  @ApiProperty({ required: false, description: '인기 메뉴 여부로 필터링' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPopular?: boolean;

  @ApiProperty({ required: false, description: '신메뉴 여부로 필터링' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isNew?: boolean;

  @ApiProperty({ required: false, description: '추천 메뉴 여부로 필터링' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isRecommended?: boolean;
}