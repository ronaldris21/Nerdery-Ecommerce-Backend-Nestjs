import { Test, TestingModule } from '@nestjs/testing';
import { ProductCalculationsService } from './product-calculations.service';

describe('ProductCalculationsService', () => {
  let provider: ProductCalculationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductCalculationsService],
    }).compile();

    provider = module.get<ProductCalculationsService>(ProductCalculationsService);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
