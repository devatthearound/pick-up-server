import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsDateString, IsNotEmpty, IsOptional, IsString, Matches, ValidateIf } from 'class-validator';

export class CreateSpecialDayDto {
  @ApiProperty({ 
    example: '2025-04-10',
    description: '특별 영업일/휴무일 날짜 (YYYY-MM-DD 형식)' 
  })
  @IsNotEmpty({ message: '날짜는 필수입니다.' })
  @IsDateString({ strict: true }, { message: '유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식으로 입력해주세요.' })
  date: string;

  @ApiProperty({ 
    example: true,
    description: '휴무일 여부 (true: 휴무, false: 특별 영업)' 
  })
  @IsBoolean()
  isClosed: boolean;

  @ApiProperty({ 
    example: '09:00',
    description: '특별 영업일 오픈 시간 (휴무일이 아닌 경우 필수)',
    required: false
  })
  @ValidateIf(o => o.isClosed === false)
  @IsNotEmpty({ message: '특별 영업일인 경우 오픈 시간은 필수입니다.' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.' 
  })
  openingTime?: string;

  @ApiProperty({ 
    example: '18:00',
    description: '특별 영업일 마감 시간 (휴무일이 아닌 경우 필수)',
    required: false
  })
  @ValidateIf(o => o.isClosed === false)
  @IsNotEmpty({ message: '특별 영업일인 경우 마감 시간은 필수입니다.' })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.' 
  })
  closingTime?: string;

  @ApiProperty({ 
    example: '창립기념일',
    description: '특별 영업일/휴무일 사유',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class UpdateSpecialDayDto {
  @ApiProperty({ 
    example: true,
    description: '휴무일 여부 (true: 휴무, false: 특별 영업)',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;

  @ApiProperty({ 
    example: '09:00',
    description: '특별 영업일 오픈 시간',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.' 
  })
  openingTime?: string;

  @ApiProperty({ 
    example: '18:00',
    description: '특별 영업일 마감 시간',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.' 
  })
  closingTime?: string;

  @ApiProperty({ 
    example: '창립기념일',
    description: '특별 영업일/휴무일 사유',
    required: false
  })
  @IsOptional()
  @IsString()
  reason?: string;
}

export class SpecialDayQueryDto {
  @ApiProperty({ 
    example: '2025-04-01',
    description: '조회 시작일 (YYYY-MM-DD 형식)',
    required: false
  })
  @IsOptional()
  @IsDateString({ strict: true }, { message: '유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식으로 입력해주세요.' })
  startDate?: string;

  @ApiProperty({ 
    example: '2025-04-30',
    description: '조회 종료일 (YYYY-MM-DD 형식)',
    required: false
  })
  @IsOptional()
  @IsDateString({ strict: true }, { message: '유효한 날짜 형식이 아닙니다. YYYY-MM-DD 형식으로 입력해주세요.' })
  endDate?: string;

  @ApiProperty({ 
    example: true,
    description: '휴무일만 조회 (true: 휴무일만, false: 특별 영업일만, 미지정: 모두)',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}