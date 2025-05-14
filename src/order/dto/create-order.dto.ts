import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentMethod } from '../entities/order.entity';

export class OrderItemOptionDto {
  @ApiProperty({ example: 1, description: '옵션 아이템 ID' })
  @IsNumber()
  @IsNotEmpty()
  optionItemId: number;

  @ApiProperty({ example: 1, description: '옵션 수량', required: false })
  @IsOptional()
  @IsNumber()
  quantity?: number;
}

export class OrderItemDto {
  @ApiProperty({ example: 1, description: '메뉴 아이템 ID' })
  @IsNumber()
  @IsNotEmpty()
  menuItemId: number;

  @ApiProperty({ example: 2, description: '주문 수량' })
  @IsNumber()
  @IsNotEmpty()
  quantity: number;

  @ApiProperty({ example: '소스 적게 주세요', description: '특별 요청사항', required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @ApiProperty({ type: [OrderItemOptionDto], description: '선택한 옵션 목록', required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemOptionDto)
  options?: OrderItemOptionDto[];
}

export class GuestInfoDto {
  @ApiProperty({ example: '홍길동', description: '비회원 주문 시 고객 이름' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: '010-1234-5678', description: '비회원 주문 시 고객 전화번호' })
  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class CreateOrderDto {
  // @ApiProperty({ example: 1, description: '매장 ID' })
  // @IsNumber()
  // @IsNotEmpty()
  // storeId: number;

  @ApiProperty({ example: 'store.domain.com', description: '매장 도메인' })
  @IsString()
  @IsNotEmpty()
  storeDomain: string;

  @ApiProperty({ type: [OrderItemDto], description: '주문 아이템 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ example: 'CASH', description: '결제 방법', enum: PaymentMethod })
  @IsEnum(PaymentMethod)
  @IsNotEmpty()
  paymentMethod: PaymentMethod;
}