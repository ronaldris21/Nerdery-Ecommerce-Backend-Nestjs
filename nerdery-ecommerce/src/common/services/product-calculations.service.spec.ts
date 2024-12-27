import { Test, TestingModule } from '@nestjs/testing';

import { ProductHelperService } from './product-calculations.service';

describe('ProductCalculationsService', () => {
  let provider: ProductHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductHelperService],
    }).compile();

    provider = module.get<ProductHelperService>(ProductHelperService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
