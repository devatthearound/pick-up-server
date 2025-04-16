import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum DeviceType {
  IOS = 'IOS',
  ANDROID = 'ANDROID',
  WEB = 'WEB',
}

export class RegisterFcmTokenDto {
  @ApiProperty({
    description: 'FCM 토큰',
    example: 'fcm_token_string',
  })
  @IsString()
  @IsNotEmpty()
  fcmToken: string;

  @ApiProperty({
    description: '기기 타입',
    enum: DeviceType,
    example: DeviceType.IOS,
  })
  @IsEnum(DeviceType)
  @IsNotEmpty()
  deviceType: DeviceType;

  @ApiProperty({
    description: '기기 식별자',
    example: 'device_identifier',
  })
  @IsString()
  @IsNotEmpty()
  deviceId: string;
} 