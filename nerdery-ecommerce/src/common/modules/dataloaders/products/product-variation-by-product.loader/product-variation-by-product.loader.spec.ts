import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { DataloadersService } from '../../dataloaders.service';

import { ProductVariationByProductLoader } from './product-variation-by-product.loader';

describe('ProductVariationByProductLoader', () => {
  let loader: ProductVariationByProductLoader;
  let dataloadersService: DeepMocked<DataloadersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariationByProductLoader,
        { provide: DataloadersService, useValue: createMock<DataloadersService>() },
      ],
    }).compile();

    loader = await module.resolve<ProductVariationByProductLoader>(ProductVariationByProductLoader);
    dataloadersService = module.get(DataloadersService);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
    expect(dataloadersService).toBeDefined();
  });
});
