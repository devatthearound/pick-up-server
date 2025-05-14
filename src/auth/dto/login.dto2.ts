import { IsString, MinLength, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto2 {
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
} 