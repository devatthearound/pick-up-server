import { ApiProperty } from '@nestjs/swagger';
import { 
  IsNotEmpty, 
  IsString, 
  IsOptional, 
  IsBoolean, 
  IsNumber, 
  IsDateString 
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateStoreBenefitDto {
  @ApiProperty({ example: '첫 방문 할인', description: '혜택 제목' })
  @IsNotEmpty({ message: '혜택 제목은 필수입니다.' })
  @IsString()
  title: string;

  @ApiProperty({ example: '첫 방문 고객 10% 할인', description: '혜택 설명' })
  @IsNotEmpty({ message: '혜택 설명은 필수입니다.' })
  @IsString()
  description: string;

  @ApiProperty({ 
    example: '메뉴 구매 시 5,000원 이상 주문', 
    description: '혜택 조건 설명', 
    required: false 
  })
  @IsOptional()
  @IsString()
  conditionDescription?: string;

  @ApiProperty({ example: true, description: '혜택 활성 상태', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ 
    example: '2025-12-31', 
    description: '혜택 종료 날짜', 
    required: false 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 1, description: '표시 순서', required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class UpdateStoreBenefitDto {
  @ApiProperty({ example: '신규 고객 할인', description: '혜택 제목', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: '신규 고객 15% 할인', description: '혜택 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ 
    example: '10,000원 이상 주문 시 적용', 
    description: '혜택 조건 설명', 
    required: false 
  })
  @IsOptional()
  @IsString()
  conditionDescription?: string;

  @ApiProperty({ example: true, description: '혜택 활성 상태', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ 
    example: '2025-12-31', 
    description: '혜택 종료 날짜', 
    required: false 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ example: 2, description: '표시 순서', required: false })
  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class StoreBenefitQueryDto {
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

  @ApiProperty({ required: false, description: '활성 상태로 필터링' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean;

  @ApiProperty({ required: false, description: '현재 진행 중인 혜택만 조회' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isOngoing?: boolean;
}