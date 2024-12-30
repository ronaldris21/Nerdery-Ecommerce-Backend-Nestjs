import { plainToInstance } from 'class-transformer';
import { IsNumber, IsString } from 'class-validator';
import { validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsString()
  CLOUDINARY_NAME: string;

  @IsString()
  CLOUDINARY_API_KEY: string;

  @IsString()
  CLOUDINARY_API_SECRET: string;

  @IsString()
  MAIL_HOST: string;

  @IsString()
  MAIL_FROM: string;

  @IsString()
  MAIL_USER: string;

  @IsString()
  MAIL_PASS: string;

  @IsNumber()
  PORT: number;

  @IsNumber()
  SECURITY_BCRYPT_SALT_OR_ROUND: number;

  @IsString()
  JWT_EXPIRATION_IN: string;

  @IsString()
  JWT_REFRESH_IN: string;

  @IsString()
  JWT_ACCESS_SECRET: string;

  @IsString()
  JWT_REFRESH_SECRET: string;

  @IsString()
  FRONTEND_RESET_PASSWORD_URL: string;

  @IsString()
  FRONTEND_PAYMENT_CLIENT_SECRET_URL: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  NODE_ENV: string;

  @IsString()
  DATABASE_URL: string;

  @IsString()
  STRIPE_API_KEY: string;

  @IsString()
  STRIPE_WEBHOOK_SECRET: string;
}

export const validateEnv = (config: Record<string, unknown>) => {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }
  return validatedConfig;
};
