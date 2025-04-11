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

export class CreateOrderDto {
  @ApiProperty({ example: 1, description: '매장 ID' })
  @IsNumber()
  @IsNotEmpty()
  storeId: number;

  @ApiProperty({ example: 1, description: '회원 ID (선택)', required: false })
  @IsOptional()
  @IsNumber()
  customerId?: number;

  @ApiProperty({ type: [OrderItemDto], description: '주문 아이템 목록' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  orderItems: OrderItemDto[];

  @ApiProperty({ example: '2025-04-10T14:30:00Z', description: '픽업 예정 시간' })
  @IsDateString()
  pickupTime: string;

  @ApiProperty({ enum: PaymentMethod, description: '결제 방법', example: PaymentMethod.CREDIT_CARD })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: '알레르기가 있으니 주의해 주세요', description: '고객 요청사항', required: false })
  @IsOptional()
  @IsString()
  customerNote?: string;

  @ApiProperty({ example: '홍길동', description: '고객 이름 (비회원 필수)', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ example: '010-1234-5678', description: '고객 전화번호 (비회원 필수)', required: false })
  @IsOptional()
  @IsString()
  customerPhone?: string;
}