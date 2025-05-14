import { plainToClass } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsString, validateSync } from 'class-validator';
import { IsNotEmpty } from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsNumber()
  @IsOptional()
  PORT: number;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  JWT_EXPIRATION: string;

  @IsString()
  @IsOptional()
  UPLOAD_DIR: string;

  @IsNumber()
  @IsOptional()
  MAX_FILE_SIZE: number;

  @IsString()
  FRONTEND_URL: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  @IsNumber()
  @IsNotEmpty()
  REDIS_PORT: number;

  @IsString()
  @IsOptional()
  REDIS_PASSWORD: string;

  @IsString()
  @IsNotEmpty()
  NCP_ACCESS_KEY_ID: string;

  @IsString()
  @IsNotEmpty()
  NCP_SERVICE_ID: string;

  @IsString()
  @IsNotEmpty()
  NCP_TALK_SERVICE_ID: string;

  @IsString()
  @IsNotEmpty()
  NCP_SECRET: string;

  @IsString()
  @IsNotEmpty()
  NCP_SMS_BASE_URI: string;

  @IsString()
  @IsNotEmpty()
  SMS_MYNUM: string;

  @IsString()
  @IsNotEmpty()
  NCP_SMS_URI: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToClass(
    EnvironmentVariables,
    config,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
} 