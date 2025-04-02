import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  CUSTOMER = 'customer',
  OWNER = 'owner',
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: '사용자 이메일' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: '비밀번호 (최소 6자)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '010-1234-5678', description: '전화번호' })
  @IsString()
  phone: string;

  @ApiProperty({ example: '홍', description: '이름' })
  @IsString()
  first_name: string;

  @ApiProperty({ example: '길동', description: '성' })
  @IsString()
  last_name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER, description: '사용자 역할' })
  @IsEnum(UserRole)
  role: UserRole;
} 