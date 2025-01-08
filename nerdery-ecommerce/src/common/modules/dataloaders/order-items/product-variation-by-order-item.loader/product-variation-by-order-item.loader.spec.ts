import { Test, TestingModule } from '@nestjs/testing';

import { ProductVariationByOrderItemLoader } from './product-variation-by-order-item.loader';

describe('ProductVariationByOrderItemLoader', () => {
  let provider: ProductVariationByOrderItemLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductVariationByOrderItemLoader],
    }).compile();

    provider = module.get<ProductVariationByOrderItemLoader>(ProductVariationByOrderItemLoader);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
