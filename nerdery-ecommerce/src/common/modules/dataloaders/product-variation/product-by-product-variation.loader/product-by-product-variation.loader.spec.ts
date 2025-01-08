import { Test, TestingModule } from '@nestjs/testing';

import { ProductByProductVariationLoader } from './product-by-product-variation.loader';

describe('ProductByProductVariationLoader', () => {
  let provider: ProductByProductVariationLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductByProductVariationLoader],
    }).compile();

    provider = module.get<ProductByProductVariationLoader>(ProductByProductVariationLoader);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
