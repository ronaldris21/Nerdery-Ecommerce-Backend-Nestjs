import { Test, TestingModule } from '@nestjs/testing';
import { ProductsBycategoryLoader } from './products-bycategory.loader';

describe('ProductsBycategoryLoader', () => {
  let provider: ProductsBycategoryLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductsBycategoryLoader],
    }).compile();

    provider = module.get<ProductsBycategoryLoader>(ProductsBycategoryLoader);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
