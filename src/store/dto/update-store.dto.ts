import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, IsBoolean, Matches, MaxLength } from 'class-validator';

export class UpdateStoreDto {
  @ApiProperty({ example: '커피월드', description: '상점 이름', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '상점 이름은 100자를 초과할 수 없습니다.' })
  name?: string;

  @ApiProperty({ example: 'Coffee World', description: '상점 영어 이름', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '상점 영어 이름은 100자를 초과할 수 없습니다.' })
  englishName?: string;

  @ApiProperty({ example: '123-45-67890', description: '사업자 등록 번호', required: false })
  @IsOptional()
  @IsString()
  @Matches(/^\d{3}-\d{2}-\d{5}$/, { message: '올바른 사업자 등록 번호 형식이 아닙니다. (예: 123-45-67890)' })
  businessRegistrationNumber?: string;

  @ApiProperty({ example: 'business_registration.pdf', description: '사업자 등록증 파일', required: false })
  @IsOptional()
  @IsString()
  businessRegistrationFile?: string;

  @ApiProperty({ example: 1, description: '상점 카테고리 ID', required: false })
  @IsOptional()
  @IsNumber()
  categoryId?: number;

  @ApiProperty({ example: '서울시 강남구 테헤란로 123', description: '상점 주소', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '주소는 255자를 초과할 수 없습니다.' })
  address?: string;

  @ApiProperty({ example: '7층 701호', description: '상점 상세 주소', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '상세 주소는 100자를 초과할 수 없습니다.' })
  addressDetail?: string;

  @ApiProperty({ example: '02-1234-5678', description: '상점 전화번호', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(20, { message: '전화번호는 20자를 초과할 수 없습니다.' })
  phone?: string;

  @ApiProperty({ example: '월-금: 09:00-18:00, 주말: 10:00-17:00', description: '영업 시간', required: false })
  @IsOptional()
  @IsString()
  @MaxLength(255, { message: '영업 시간은 255자를 초과할 수 없습니다.' })
  businessHours?: string;

  @ApiProperty({ example: '맛있는 커피를 제공하는 카페입니다.', description: '상점 설명', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'logo.jpg', description: '로고 이미지', required: false })
  @IsOptional()
  @IsString()
  logoImage?: string;

  @ApiProperty({ example: 'banner.jpg', description: '배너 이미지', required: false })
  @IsOptional()
  @IsString()
  bannerImage?: string;

  @ApiProperty({ example: false, description: '인증 여부 (관리자만 설정 가능)', required: false })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @ApiProperty({ example: true, description: '활성 여부', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
