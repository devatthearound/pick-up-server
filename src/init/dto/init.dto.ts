import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class InitDto {
    // 1. accessToken
    @ApiProperty({ example: 'accessToken', description: 'accessToken' })
    accessToken: string;
} 