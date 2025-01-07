import { Test, TestingModule } from '@nestjs/testing';

import { ProductVariationImagesService } from './product-variation-images.service';

describe('ProductVariationImagesService', () => {
  let service: ProductVariationImagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductVariationImagesService],
    }).compile();

    service = module.get<ProductVariationImagesService>(ProductVariationImagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
