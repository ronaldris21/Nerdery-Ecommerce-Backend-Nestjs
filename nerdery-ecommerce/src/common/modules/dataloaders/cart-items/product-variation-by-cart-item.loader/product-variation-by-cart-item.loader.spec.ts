import { Test, TestingModule } from '@nestjs/testing';

import { ProductVariationByCartItemLoader } from './product-variation-by-cart-item.loader';

describe('ProductVariationByCartItemLoader', () => {
  let provider: ProductVariationByCartItemLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductVariationByCartItemLoader],
    }).compile();

    provider = module.get<ProductVariationByCartItemLoader>(ProductVariationByCartItemLoader);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
