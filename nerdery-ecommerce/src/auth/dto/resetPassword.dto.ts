import { IsString, IsNotEmpty, MinLength, IsUUID } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  resetToken: string;

  @IsString()
  @MinLength(8)
  password: string;
}
