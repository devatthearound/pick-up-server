import { ApiProperty } from '@nestjs/swagger';
import { 
  IsEnum, 
  IsOptional, 
  IsBoolean, 
  IsString, 
  Matches, 
  ValidateIf 
} from 'class-validator';
import { DayOfWeek } from '../entities/menu-availability.entity';

export class CreateMenuAvailabilityDto {
  @ApiProperty({ 
    enum: DayOfWeek, 
    example: DayOfWeek.MONDAY, 
    description: '요일' 
  })
  @IsEnum(DayOfWeek)
  dayOfWeek: DayOfWeek;

  @ApiProperty({ 
    example: '09:00',
    description: '시작 시간 (24시간 형식, HH:MM)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.'
  })
  @ValidateIf(o => o.isAvailable !== false)
  startTime?: string;

  @ApiProperty({ 
    example: '18:00',
    description: '종료 시간 (24시간 형식, HH:MM)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.'
  })
  @ValidateIf(o => o.isAvailable !== false)
  endTime?: string;

  @ApiProperty({ 
    example: true,
    description: '메뉴 가용 상태',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateMenuAvailabilityDto {
  @ApiProperty({ 
    example: '10:00',
    description: '시작 시간 (24시간 형식, HH:MM)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.'
  })
  startTime?: string;

  @ApiProperty({ 
    example: '20:00',
    description: '종료 시간 (24시간 형식, HH:MM)',
    required: false
  })
  @IsOptional()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { 
    message: '시간 형식이 올바르지 않습니다. HH:MM 형태로 입력해주세요.'
  })
  endTime?: string;

  @ApiProperty({ 
    example: true,
    description: '메뉴 가용 상태',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class MenuAvailabilityQueryDto {
  @ApiProperty({ 
    enum: DayOfWeek, 
    example: DayOfWeek.MONDAY, 
    description: '특정 요일로 필터링',
    required: false
  })
  @IsOptional()
  @IsEnum(DayOfWeek)
  dayOfWeek?: DayOfWeek;

  @ApiProperty({ 
    example: true,
    description: '가용 상태로 필터링',
    required: false
  })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}