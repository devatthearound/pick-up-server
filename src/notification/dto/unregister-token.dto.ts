import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UnregisterTokenDto {
  @ApiProperty({
    description: '기기 식별자',
    example: 'device_identifier',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;
} 