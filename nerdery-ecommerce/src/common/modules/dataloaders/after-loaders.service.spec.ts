import { Test, TestingModule } from '@nestjs/testing';

import { AfterLoadersService } from './after-loaders.service';

describe('AfterLoadersService', () => {
  let provider: AfterLoadersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AfterLoadersService],
    }).compile();

    provider = module.get<AfterLoadersService>(AfterLoadersService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
