import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendNotificationDto {
  @ApiProperty({
    description: '사용자 ID',
    example: 1,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number;

  @ApiProperty({
    description: '알림 제목',
    example: '새로운 메시지',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: '알림 내용',
    example: '새로운 메시지가 도착했습니다.',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({
    description: '추가 데이터',
    example: { messageId: '123', type: 'MESSAGE' },
    required: false,
  })
  @IsOptional()
  data?: Record<string, any>;
} 