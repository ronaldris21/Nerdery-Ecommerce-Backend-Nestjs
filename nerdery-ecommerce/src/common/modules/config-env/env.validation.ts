/* eslint-disable unused-imports/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { debug } from 'console';

import { plainToInstance } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsString, Min, MinLength } from 'class-validator';
import { validateSync } from 'class-validator';
import ms from 'ms';

class EnvironmentVariables {
  @IsString()
  @IsNotEmpty()
  CLOUDINARY_NAME: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  CLOUDINARY_API_SECRET: string;

  @IsString()
  @IsNotEmpty()
  MAIL_HOST: string;

  @IsString()
  @IsNotEmpty()
  MAIL_FROM: string;

  @IsString()
  @IsNotEmpty()
  MAIL_USER: string;

  @IsString()
  @IsNotEmpty()
  MAIL_PASS: string;

  @IsNumber()
  @Min(1)
  PORT: number;

  @IsNumber()
  SECURITY_BCRYPT_SALT_OR_ROUND: number;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRATION_IN: string;

  @IsString()
  @IsNotEmpty()
  JWT_REFRESH_IN: string;

  @IsString()
  @MinLength(30)
  JWT_ACCESS_SECRET: string;

  @IsString()
  @MinLength(30)
  JWT_REFRESH_SECRET: string;

  @IsString()
  @IsNotEmpty()
  FRONTEND_RESET_PASSWORD_URL: string;

  @IsString()
  @IsNotEmpty()
  FRONTEND_PAYMENT_CLIENT_SECRET_URL: string;

  @IsString()
  @IsNotEmpty()
  REDIS_HOST: string;

  @IsNumber()
  @Min(1)
  REDIS_PORT: number;

  @IsString()
  NODE_ENV: string;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL: string;

  @IsString()
  @IsNotEmpty()
  STRIPE_API_KEY: string;

  @IsString()
  @IsNotEmpty()
  STRIPE_WEBHOOK_SECRET: string;
}

const printVariableToTime = (variable: string, time: number) => {
  return `${variable} - expires in: ${time / 1000} seconds  = ${time / 1000 / 60} minutes  = ${time / 1000 / 60 / 60} hours  =  ${time / 1000 / 60 / 60 / 24} days`;
};

export const validateEnv = (config: Record<string, unknown>) => {
  debug('Validating environment variables\n\n');
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });
  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  const expiresIn: number = ms(validatedConfig.JWT_EXPIRATION_IN);
  if (!expiresIn || expiresIn < 1000 * 60 * 5) {
    throw new Error(
      'JWT_EXPIRATION_IN must be valid ms strings. At least 5 minutes. Check https://www.npmjs.com/package/ms for more information.',
    );
  }
  debug(printVariableToTime('JWT_EXPIRATION_IN', expiresIn));

  const refreshIn: number = ms(validatedConfig.JWT_REFRESH_IN);
  if (!refreshIn || refreshIn < 1000 * 60 * 60) {
    throw new Error(
      'JWT_REFRESH_IN must be valid ms strings. At least 60 minutes. Check https://www.npmjs.com/package/ms for more information.',
    );
  }
  debug(printVariableToTime('JWT_REFRESH_IN', refreshIn));

  debug('\n\n Environment variables validated successfully\n\n');

  return validatedConfig;
};
