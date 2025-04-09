import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString } from 'class-validator';
import { OrderStatus } from '../entities/order.entity';

export class UpdateOrderStatusDto {
  @ApiProperty({ enum: OrderStatus, description: '주문 상태', example: OrderStatus.ACCEPTED })
  @IsEnum(OrderStatus)
  status: OrderStatus;

  @ApiProperty({ example: '재고 부족으로 거부되었습니다.', description: '거부 이유 (거부 상태인 경우)', required: false })
  @IsOptional()
  @IsString()
  rejectionReason?: string;
}