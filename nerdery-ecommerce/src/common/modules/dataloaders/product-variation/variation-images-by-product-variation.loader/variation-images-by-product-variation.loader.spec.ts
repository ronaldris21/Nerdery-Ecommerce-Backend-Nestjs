import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { DataloadersService } from '../../dataloaders.service';

import { VariationImagesByProductVariationLoader } from './variation-images-by-product-variation.loader';

describe('VariationImagesByProductVariationLoader', () => {
  let loader: VariationImagesByProductVariationLoader;
  let dataloadersService: DeepMocked<DataloadersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VariationImagesByProductVariationLoader,
        { provide: DataloadersService, useValue: createMock<DataloadersService>() },
      ],
    }).compile();

    loader = await module.resolve<VariationImagesByProductVariationLoader>(
      VariationImagesByProductVariationLoader,
    );
    dataloadersService = module.get(DataloadersService);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
    expect(dataloadersService).toBeDefined();
  });
});
