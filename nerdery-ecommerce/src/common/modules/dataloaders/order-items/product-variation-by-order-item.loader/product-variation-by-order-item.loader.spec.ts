import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { DataloadersService } from '../../dataloaders.service';

import { ProductVariationByOrderItemLoader } from './product-variation-by-order-item.loader';

describe('ProductVariationByOrderItemLoader', () => {
  let loader: ProductVariationByOrderItemLoader;
  let dataloadersService: DeepMocked<DataloadersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariationByOrderItemLoader,
        { provide: DataloadersService, useValue: createMock<DataloadersService>() },
      ],
    }).compile();

    loader = await module.resolve<ProductVariationByOrderItemLoader>(
      ProductVariationByOrderItemLoader,
    );
    dataloadersService = module.get(DataloadersService);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
    expect(dataloadersService).toBeDefined();
  });
});
