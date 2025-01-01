import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { hash, compare } from 'bcrypt';
import { ConfigNames } from 'src/common/config/config.interface';

import { PasswordService } from './password.service';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('PasswordService', () => {
  let passwordService: PasswordService;
  let mockConfigService: Partial<ConfigService>;

  beforeEach(async () => {
    // Mock ConfigService
    mockConfigService = {
      get: jest.fn().mockImplementation((key: string) => {
        if (key === ConfigNames.jwt) {
          return {
            bcryptSaltOrRound: 10, // Mocked value for bcrypt salt or rounds
          };
        }
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PasswordService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    passwordService = module.get<PasswordService>(PasswordService);
  });

  it('should be defined', () => {
    expect(passwordService).toBeDefined();
  });

  describe('bcryptSaltRounds', () => {
    it('should return a number if the config value is a number', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce({ bcryptSaltOrRound: 7 });
      expect(passwordService.bcryptSaltRounds).toBe(7);
    });

    it('should return 10 as default value from undefined', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce({ bcryptSaltOrRound: undefined });
      expect(passwordService.bcryptSaltRounds).toBe(10);
    });

    it('should return 10 as default value from null', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce({ bcryptSaltOrRound: null });
      expect(passwordService.bcryptSaltRounds).toBe(10);
    });

    it('should return 10 as default value from empty string', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce({ bcryptSaltOrRound: '' });
      expect(passwordService.bcryptSaltRounds).toBe(10);
    });

    it('should parse a string into a number if the config value is a string', () => {
      jest.spyOn(mockConfigService, 'get').mockReturnValueOnce({ bcryptSaltOrRound: '12' });
      expect(passwordService.bcryptSaltRounds).toBe(12);
    });
  });

  describe('hashPassword', () => {
    it('should hash the password with the correct salt rounds', async () => {
      const password = 'myPassword';
      const hashedPassword = 'hashedPassword';
      (hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await passwordService.hashPassword(password);
      expect(hash).toHaveBeenCalledWith(password, 10);
      expect(result).toBe(hashedPassword);
    });
  });

  describe('validatePassword', () => {
    it('should return true if the password matches the hash', async () => {
      const password = 'myPassword';
      const hashedPassword = 'hashedPassword';
      (compare as jest.Mock).mockResolvedValue(true);

      const result = await passwordService.validatePassword(password, hashedPassword);
      expect(compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(true);
    });

    it('should return false if the password does not match the hash', async () => {
      const password = 'myPassword';
      const hashedPassword = 'wrongHash';
      (compare as jest.Mock).mockResolvedValue(false);

      const result = await passwordService.validatePassword(password, hashedPassword);
      expect(compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBe(false);
    });
  });
});
