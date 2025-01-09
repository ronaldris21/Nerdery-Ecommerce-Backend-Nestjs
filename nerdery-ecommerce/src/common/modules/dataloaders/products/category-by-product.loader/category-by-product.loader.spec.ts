import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { DataloadersService } from '../../dataloaders.service';

import { CategoryByProductLoader } from './category-by-product.loader';

describe('CategoryByProductLoader', () => {
  let loader: CategoryByProductLoader;
  let dataloadersService: DeepMocked<DataloadersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CategoryByProductLoader,
        { provide: DataloadersService, useValue: createMock<DataloadersService>() },
      ],
    }).compile();

    loader = await module.resolve<CategoryByProductLoader>(CategoryByProductLoader);
    dataloadersService = module.get(DataloadersService);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
    expect(dataloadersService).toBeDefined();
  });
});
