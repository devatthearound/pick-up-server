import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, ValidateIf } from 'class-validator';
import { PauseType } from '../entities/store-operation-status.entity';

export class PauseOrdersDto {
  @ApiProperty({
    enum: PauseType,
    example: PauseType.TEMPORARY,
    description: '일시 중지 유형 (temporary: 임시, today: 오늘 하루, indefinite: 무기한)',
  })
  @IsEnum(PauseType)
  @IsNotEmpty()
  pauseType: PauseType;

  @ApiProperty({
    example: 2,
    description: '일시 중지 시간 (시간 단위, pauseType이 temporary인 경우에만 필요)',
    required: false,
  })
  @ValidateIf(o => o.pauseType === PauseType.TEMPORARY)
  @IsNumber()
  @IsNotEmpty()
  hours?: number;

  @ApiProperty({
    example: '재료 소진으로 인한 영업 중단',
    description: '일시 중지 사유',
    required: false,
  })
  @IsOptional()
  @IsString()
  pauseReason?: string;
}

export class GetOperationStatusDto {
  @ApiProperty({
    example: true,
    description: '주문 수신 상태',
  })
  isAcceptingOrders: boolean;

  @ApiProperty({
    enum: PauseType,
    example: PauseType.TEMPORARY,
    description: '일시 중지 유형',
    nullable: true
  })
  pauseType: PauseType | null;

  @ApiProperty({
    example: '2023-12-31T23:59:59.999Z',
    description: '일시 중지 종료 시간',
    nullable: true
  })
  pauseUntil: Date | null;

  @ApiProperty({
    example: '재료 소진으로 인한 영업 중단',
    description: '일시 중지 사유',
    nullable: true
  })
  pauseReason: string | null;
}

export class PauseHistoryQueryDto {
  @ApiProperty({
    example: '2023-01-01',
    description: '조회 시작일 (YYYY-MM-DD 형식)',
    required: false,
  })
  @IsOptional()
  @IsString()
  startDate?: string;

  @ApiProperty({
    example: '2023-12-31',
    description: '조회 종료일 (YYYY-MM-DD 형식)',
    required: false,
  })
  @IsOptional()
  @IsString()
  endDate?: string;

  @ApiProperty({
    enum: PauseType,
    example: PauseType.TEMPORARY,
    description: '일시 중지 유형으로 필터링',
    required: false,
  })
  @IsOptional()
  @IsEnum(PauseType)
  pauseType?: PauseType;

  @ApiProperty({
    example: 1,
    description: '페이지 번호',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  page?: number = 1;

  @ApiProperty({
    example: 10,
    description: '페이지당 항목 수',
    required: false,
  })
  @IsOptional()
  @IsNumber()
  limit?: number = 10;
}