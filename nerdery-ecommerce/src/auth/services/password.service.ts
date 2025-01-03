import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';
import { ConfigNames, JwtConfig } from 'src/common/config/config.interface';

@Injectable()
export class PasswordService {
  constructor(private configService: ConfigService) {}

  get bcryptSaltRounds(): string | number {
    const SecurityConfig = this.configService.get<JwtConfig>(ConfigNames.jwt).bcryptSaltOrRound;

    if (typeof SecurityConfig === 'number') {
      return SecurityConfig;
    }
    const parseValue = parseInt(SecurityConfig, 10);
    return isNaN(parseValue) ? 10 : parseValue; // Default value is 10
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password, this.bcryptSaltRounds);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }
}
