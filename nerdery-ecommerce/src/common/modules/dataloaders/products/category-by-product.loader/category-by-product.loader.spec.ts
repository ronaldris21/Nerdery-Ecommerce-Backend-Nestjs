import { Test, TestingModule } from '@nestjs/testing';

import { CategoryByProductLoader } from './category-by-product.loader';

describe('CategoryByProductLoader', () => {
  let provider: CategoryByProductLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoryByProductLoader],
    }).compile();

    provider = module.get<CategoryByProductLoader>(CategoryByProductLoader);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
