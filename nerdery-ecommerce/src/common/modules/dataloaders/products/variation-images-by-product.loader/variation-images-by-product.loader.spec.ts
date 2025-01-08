import { Test, TestingModule } from '@nestjs/testing';

import { VariationImagesByProductLoader } from './variation-images-by-product.loader';

describe('VariationImagesByProductLoader', () => {
  let provider: VariationImagesByProductLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [VariationImagesByProductLoader],
    }).compile();

    provider = module.get<VariationImagesByProductLoader>(VariationImagesByProductLoader);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
