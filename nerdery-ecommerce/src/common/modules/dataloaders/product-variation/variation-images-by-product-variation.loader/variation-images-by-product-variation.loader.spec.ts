import { Test, TestingModule } from '@nestjs/testing';

import { VariationImagesByProductVariationLoader } from './variation-images-by-product-variation.loader';

describe('VariationImageByProductVariationLoader', () => {
  let provider: VariationImagesByProductVariationLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VariationImageByProductVariationLoader],
    }).compile();

    provider = module.get<VariationImageByProductVariationLoader>(
      VariationImageByProductVariationLoader,
    );
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
