import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, IsDateString, IsBoolean } from 'class-validator';
import { OrderStatus, PaymentStatus } from '../entities/order.entity';

export enum SortBy {
  CREATED_AT = 'createdAt',
  PICKUP_TIME = 'pickupTime',
  STATUS = 'status',
}

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

export class OrderQueryDto {
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

  @ApiProperty({ required: false, description: '매장 ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  storeId?: number;

  @ApiProperty({ required: false, description: '고객 ID' })
  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  customerId?: number;

  @ApiProperty({ required: false, description: '주문 번호 (부분 일치 검색)' })
  @IsOptional()
  @IsString()
  orderNumber?: string;

  @ApiProperty({ required: false, enum: OrderStatus, description: '주문 상태' })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

  @ApiProperty({ required: false, enum: PaymentStatus, description: '결제 상태' })
  @IsOptional()
  @IsEnum(PaymentStatus)
  paymentStatus?: PaymentStatus;

  @ApiProperty({ required: false, description: '픽업 시간 이후 (YYYY-MM-DD 또는 ISO 날짜)' })
  @IsOptional()
  @IsDateString()
  pickupFrom?: string;

  @ApiProperty({ required: false, description: '픽업 시간 이전 (YYYY-MM-DD 또는 ISO 날짜)' })
  @IsOptional()
  @IsDateString()
  pickupTo?: string;

  @ApiProperty({ required: false, description: '주문 생성 시간 이후 (YYYY-MM-DD 또는 ISO 날짜)' })
  @IsOptional()
  @IsDateString()
  createdFrom?: string;

  @ApiProperty({ required: false, description: '주문 생성 시간 이전 (YYYY-MM-DD 또는 ISO 날짜)' })
  @IsOptional()
  @IsDateString()
  createdTo?: string;

  @ApiProperty({ required: false, enum: SortBy, description: '정렬 기준' })
  @IsOptional()
  @IsEnum(SortBy)
  sortBy?: SortBy = SortBy.CREATED_AT;

  @ApiProperty({ required: false, enum: SortOrder, description: '정렬 방향' })
  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.DESC;

  @ApiProperty({ required: false, description: '현재 주문만 (완료/취소 제외)' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  activeOnly?: boolean;
}