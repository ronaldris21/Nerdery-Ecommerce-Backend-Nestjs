import { Test, TestingModule } from '@nestjs/testing';

import { IdValidatorService } from './id-validator.service';

describe('IdValidatorService', () => {
  let service: IdValidatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [IdValidatorService],
    }).compile();

    service = module.get<IdValidatorService>(IdValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
