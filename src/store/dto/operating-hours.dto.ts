import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsBoolean, IsString, Matches, ValidateIf } from 'class-validator';
import { DayOfWeek } from '../entities/store-operating-hour.entity';

export class CreateOperatingHourDto {
  @ApiProperty({ 
    enum: DayOfWeek, 
    example: DayOfWeek.MONDAY, 
    description: '요일' 
  })
  @IsEnum(DayOfWeek)
  @IsNotEmpty({ message: '요일은 필수입니다.' })
  dayOfWeek: DayOfWeek;

  @ApiProperty({ 
    example: '09:00',
    description: '오픈 시간 (24시간 형식, HH:MM)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.'
  })
  @ValidateIf((o) => !o.isDayOff)
  @IsNotEmpty({ message: '오픈 시간은 필수입니다.' })
  openingTime: string;

  @ApiProperty({ 
    example: '18:00',
    description: '마감 시간 (24시간 형식, HH:MM)',
  })
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.'
  })
  @ValidateIf((o) => !o.isDayOff)
  @IsNotEmpty({ message: '마감 시간은 필수입니다.' })
  closingTime: string;

  @ApiProperty({ 
    example: '12:00',
    description: '휴게 시작 시간 (24시간 형식, HH:MM)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.'
  })
  breakStartTime?: string;

  @ApiProperty({ 
    example: '13:00',
    description: '휴게 종료 시간 (24시간 형식, HH:MM)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.'
  })
  breakEndTime?: string;

  @ApiProperty({ 
    example: false,
    description: '휴무일 여부',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isDayOff?: boolean;
}

export class UpdateOperatingHourDto {
  @ApiProperty({ 
    example: '09:00',
    description: '오픈 시간 (24시간 형식, HH:MM)',
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
    description: '마감 시간 (24시간 형식, HH:MM)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.'
  })
  closingTime?: string;

  @ApiProperty({ 
    example: '12:00',
    description: '휴게 시작 시간 (24시간 형식, HH:MM)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.'
  })
  breakStartTime?: string;

  @ApiProperty({ 
    example: '13:00',
    description: '휴게 종료 시간 (24시간 형식, HH:MM)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.'
  })
  breakEndTime?: string;

  @ApiProperty({ 
    example: false,
    description: '휴무일 여부',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isDayOff?: boolean;
}

// API 응답용 DTO
export class OperatingHoursResponseDto {
  @ApiProperty({ type: [Object], description: '영업시간 정보 배열' })
  operatingHours: any[];

  @ApiProperty({ type: Object, description: '영업시간 정보 (요일별로 그룹화)' })
  operatingHoursByDay: Record<DayOfWeek, any>;
}