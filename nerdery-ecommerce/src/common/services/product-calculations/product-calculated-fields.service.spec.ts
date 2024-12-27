import { Test, TestingModule } from '@nestjs/testing';

import { ProductCalculatedFieldsService } from './product-calculated-fields.service';

describe('ProductCalculationsService', () => {
  let provider: ProductCalculatedFieldsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductCalculatedFieldsService],
    }).compile();

    provider = module.get<ProductCalculatedFieldsService>(ProductCalculatedFieldsService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
