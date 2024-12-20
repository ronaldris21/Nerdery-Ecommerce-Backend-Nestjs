import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { compare, hash } from 'bcrypt';

import { ConfigNames, JwtConfig } from './../../common/config/config.interface';

@Injectable()
export class PasswordService {
  get bcryptSaltRounds(): string | number {
    const SecurityConfig = this.configService.get<JwtConfig>(ConfigNames.jwt).bcryptSaltOrRound;

    if (typeof SecurityConfig === 'number') {
      return SecurityConfig;
    }
    return parseInt(SecurityConfig, 10);
  }

  constructor(private configService: ConfigService) { }

  async hashPassword(password: string): Promise<string> {
    return hash(password, this.bcryptSaltRounds);
  }

  async validatePassword(password: string, hash: string): Promise<boolean> {
    return compare(password, hash);
  }
}
