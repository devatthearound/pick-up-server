import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { RecipientType } from '../entities/order-notification.entity';

export class NotificationQueryDto {
  @ApiProperty({ required: false, description: '읽음 상태로 필터링' })
  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @ApiProperty({ required: false, description: '페이지 번호' })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({ required: false, description: '페이지당 항목 수' })
  @IsOptional()
  @IsNumber()
  limit?: number = 20;
}

export class UpdateNotificationDto {
  @ApiProperty({ example: true, description: '읽음 상태' })
  @IsBoolean()
  isRead: boolean;
}

export class CreateNotificationDto {
  @ApiProperty({ example: 1, description: '주문 ID' })
  @IsNumber()
  @IsNotEmpty()
  orderId: number;

  @ApiProperty({ example: 1, description: '수신자 ID' })
  @IsNumber()
  @IsNotEmpty()
  recipientId: number;

  @ApiProperty({ enum: RecipientType, example: RecipientType.OWNER, description: '수신자 유형' })
  @IsEnum(RecipientType)
  recipientType: RecipientType;

  @ApiProperty({ example: 'order_accepted', description: '알림 유형' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ example: '주문이 접수되었습니다', description: '알림 제목' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ example: '고객님의 주문이 사장님에게 접수되었습니다', description: '알림 내용' })
  @IsString()
  @IsNotEmpty()
  message: string;
}