import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';
import { PaymentMethod, PaymentStatus } from '../entities/order.entity';

export class CreatePaymentDto {
  @ApiProperty({ example: 1, description: '주문 ID' })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ example: 15000, description: '결제 금액' })
  @IsNumber()
  @IsNotEmpty()
  amount: number;

  @ApiProperty({ enum: PaymentMethod, description: '결제 방법', example: PaymentMethod.CREDIT_CARD })
  @IsEnum(PaymentMethod)
  paymentMethod: PaymentMethod;

  @ApiProperty({ example: 'tx_123456789', description: '외부 결제 시스템 거래 ID', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({ example: { cardIssuer: 'VISA', lastDigits: '1234' }, description: '결제 상세 정보', required: false })
  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>;
}

export class UpdatePaymentStatusDto {
  @ApiProperty({ enum: PaymentStatus, description: '결제 상태', example: PaymentStatus.COMPLETED })
  @IsEnum(PaymentStatus)
  paymentStatus: PaymentStatus;

  @ApiProperty({ example: 'tx_123456789', description: '외부 결제 시스템 거래 ID', required: false })
  @IsOptional()
  @IsString()
  transactionId?: string;

  @ApiProperty({ example: { cardIssuer: 'VISA', lastDigits: '1234' }, description: '결제 상세 정보', required: false })
  @IsOptional()
  @IsObject()
  paymentDetails?: Record<string, any>;
}