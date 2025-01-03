import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { hash, compare } from 'bcrypt';
import { ConfigNames, JwtConfig } from 'src/common/config/config.interface';

import { PasswordService } from './password.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('PasswordService', () => {
  let service: PasswordService;
  let configService: Partial<ConfigService>;

  beforeEach(async () => {
    configService = {
      get: jest.fn().mockImplementation((key: string): Partial<JwtConfig> => {
        if (key === ConfigNames.jwt) {
          return {
            bcryptSaltOrRound: 10,
          };
        }
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        {
          provide: ConfigService,
          useValue: configService,
        },
      ],
    }).compile();

    service = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('bcryptSaltRounds', () => {
    it('should return a number if the config value is a number', () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce({ bcryptSaltOrRound: 7 });
      expect(service.bcryptSaltRounds).toBe(7);
      expect(configService.get).toHaveBeenCalled();
    });

    it('should return 10 as default value from undefined', () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce({ bcryptSaltOrRound: undefined });
      expect(service.bcryptSaltRounds).toBe(10);
      expect(configService.get).toHaveBeenCalled();
    });

    it('should return 10 as default value from null', () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce({ bcryptSaltOrRound: null });
      expect(service.bcryptSaltRounds).toBe(10);
      expect(configService.get).toHaveBeenCalled();
    });

    it('should return 10 as default value from empty string', () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce({ bcryptSaltOrRound: '' });
      expect(service.bcryptSaltRounds).toBe(10);
      expect(configService.get).toHaveBeenCalled();
    });

    it('should parse a string into a number if the config value is a string', () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce({ bcryptSaltOrRound: '12' });
      expect(service.bcryptSaltRounds).toBe(12);
      expect(configService.get).toHaveBeenCalled();
    });

    it('should return 10 as default value if the config value is invalid string', () => {
      jest.spyOn(configService, 'get').mockReturnValueOnce({ bcryptSaltOrRound: 'riskai' });
      expect(service.bcryptSaltRounds).toBe(10);
      expect(configService.get).toHaveBeenCalled();
    });
  });

  describe('hashPassword', () => {
    it('should hash the password with the correct salt rounds', async () => {
      const password = 'myPassword';
      const hashedPassword = 'hashedPassword';
      (hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await service.hashPassword(password);
      expect(hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('validatePassword', () => {
    it('should return true if the password matches the hash', async () => {
      const password = 'originaPassword';
      const hashedPassword = 'hashedPassword';
      (compare as jest.Mock).mockResolvedValue(true);
      const result = await service.validatePassword(password, hashedPassword);
      expect(compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false if the password does not match the hash', async () => {
      const password = 'myPassword';
      const hashedPassword = 'wrongHash';
      (compare as jest.Mock).mockResolvedValue(false);

      const result = await service.validatePassword(password, hashedPassword);
      expect(compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });
});
