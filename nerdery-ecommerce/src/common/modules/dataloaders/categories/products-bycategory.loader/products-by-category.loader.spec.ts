import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';
import { Product } from '@prisma/client';
import DataLoader from 'dataloader';
import {
  validProduct1,
  validProduct2,
  validUUID1,
  validUUID2,
  validUUID3,
} from 'src/common/testing-mocks/helper-data';

import { DataloadersService } from '../../dataloaders.service'; // Adjust the path as needed

import { ProductsBycategoryLoader } from './products-by-category.loader'; // Adjust the path as needed

describe('ProductsBycategoryLoader', () => {
  let loader: ProductsBycategoryLoader;
  let dataloadersService: DeepMocked<DataloadersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsBycategoryLoader,
        { provide: DataloadersService, useValue: createMock<DataloadersService>() },
      ],
    }).compile();

    loader = await module.resolve<ProductsBycategoryLoader>(ProductsBycategoryLoader);
    dataloadersService = module.get(DataloadersService);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
    expect(loader).toBeInstanceOf(DataLoader);
  });

  it('should batch load products by category in the order requested', async () => {
    const categoryIds = [validUUID1, validUUID2];
    const mockProducts: Product[] = [
      { ...validProduct1, categoryId: validUUID1 },
      { ...validProduct2, categoryId: validUUID2 },
    ];
    const expectedResult: Product[][] = [
      [{ ...validProduct1, categoryId: validUUID1 }],
      [{ ...validProduct2, categoryId: validUUID2 }],
    ];
    dataloadersService.listProductsByCategory.mockResolvedValueOnce(mockProducts);

    const results = await loader.loadMany(categoryIds);

    expect(results).toEqual(expectedResult);
  });

  it('should batch load products by category in the wrong order and organize them', async () => {
    const categoryIds = [validUUID1, validUUID2];
    const mockProducts: Product[] = [
      { ...validProduct2, categoryId: validUUID2 },
      { ...validProduct1, categoryId: validUUID1 },
    ];
    const expectedResults: Product[][] = [
      [{ ...validProduct1, categoryId: validUUID1 }],
      [{ ...validProduct2, categoryId: validUUID2 }],
    ];
    dataloadersService.listProductsByCategory.mockResolvedValueOnce(mockProducts);

    const results = await loader.loadMany(categoryIds);

    expect(results).toEqual(expectedResults);
  });

  it('should batch load products by category - Category with no products', async () => {
    const categoryIds = [validUUID1, validUUID3, validUUID2];
    const mockProducts: Product[] = [
      { ...validProduct2, categoryId: validUUID2 },
      { ...validProduct1, categoryId: validUUID1 },
    ];
    const expectedResults: Product[][] = [
      [{ ...validProduct1, categoryId: validUUID1 }],
      [],
      [{ ...validProduct2, categoryId: validUUID2 }],
    ];
    dataloadersService.listProductsByCategory.mockResolvedValueOnce(mockProducts);

    const results = await loader.loadMany(categoryIds);

    expect(results).toEqual(expectedResults);
  });
});
