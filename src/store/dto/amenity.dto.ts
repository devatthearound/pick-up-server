import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber, IsArray } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateAmenityDto {
  @ApiProperty({ example: '주차 가능', description: '부가서비스 이름' })
  @IsNotEmpty({ message: '부가서비스 이름은 필수입니다.' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'parking_icon.png', description: '부가서비스 아이콘', required: false })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class UpdateAmenityDto {
  @ApiProperty({ example: '주차 가능', description: '부가서비스 이름', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'parking_icon.png', description: '부가서비스 아이콘', required: false })
  @IsOptional()
  @IsString()
  icon?: string;
}

export class StoreAmenityDto {
  @ApiProperty({ example: [1, 2, 3], description: '부가서비스 ID 배열' })
  @IsArray()
  @IsNumber({}, { each: true })
  @Type(() => Number)
  amenityIds: number[];
}