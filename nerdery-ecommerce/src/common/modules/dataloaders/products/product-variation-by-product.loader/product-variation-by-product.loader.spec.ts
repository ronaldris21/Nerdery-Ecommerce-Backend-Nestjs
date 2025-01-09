import { Test, TestingModule } from '@nestjs/testing';

import { ProductVariationByProductLoader } from './product-variation-by-product.loader';

describe('ProductVariationByProductLoader', () => {
  let provider: ProductVariationByProductLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductVariationByProductLoader],
    }).compile();

    provider = module.get<ProductVariationByProductLoader>(ProductVariationByProductLoader);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
