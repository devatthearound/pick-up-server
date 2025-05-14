import { IsEmail, IsString, MinLength, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  CUSTOMER = 'customer',
  OWNER = 'owner'
}

export enum IdentifierType {
  EMAIL = 'email',
  PHONE = 'phone'
}

export class RegisterDto2 {
  @ApiProperty({ 
    enum: IdentifierType,
    example: IdentifierType.EMAIL,
    description: '식별자 타입 (email 또는 phone)' 
  })
  @IsEnum(IdentifierType)
  identifierType: IdentifierType;

  @ApiProperty({ 
    example: 'user@example.com 또는 010-1234-5678', 
    description: '이메일 또는 전화번호' 
  })
  @IsString()
  @Matches(/^([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+|^01([0|1|6|7|8|9])-?([0-9]{3,4})-?([0-9]{4})$)/, {
    message: '이메일 또는 전화번호 형식이 올바르지 않습니다.'
  })
  identifier: string;
  
  @ApiProperty({ example: 'password123', description: '비밀번호 (최소 6자)' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: '홍길동', description: '이름' })
  @IsString()
  user_name: string;

  @ApiProperty({ enum: UserRole, example: UserRole.CUSTOMER, description: '사용자 역할' })
  @IsEnum(UserRole)
  role: UserRole;
} 