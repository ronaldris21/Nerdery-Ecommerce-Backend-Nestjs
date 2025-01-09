import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';

import { AfterLoadersService } from './after-loaders.service';

describe('AfterLoadersService', () => {
  let service: DeepMocked<AfterLoadersService>;
  let jwtService: DeepMocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AfterLoadersService, { provide: JwtService, useValue: createMock<JwtService>() }],
    }).compile();

    service = module.get(AfterLoadersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
  });
});
