import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { DataloadersService } from '../../dataloaders.service';

import { ProductByProductVariationLoader } from './product-by-product-variation.loader';

describe('ProductByProductVariationLoader', () => {
  let loader: ProductByProductVariationLoader;
  let dataloadersService: DeepMocked<DataloadersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductByProductVariationLoader,
        { provide: DataloadersService, useValue: createMock<DataloadersService>() },
      ],
    }).compile();

    loader = await module.resolve<ProductByProductVariationLoader>(ProductByProductVariationLoader);
    dataloadersService = module.get(DataloadersService);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
    expect(dataloadersService).toBeDefined();
  });
});
