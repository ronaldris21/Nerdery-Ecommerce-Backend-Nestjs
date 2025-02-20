import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Product } from '@prisma/client';
import { Gender } from 'src/common/data/enums/gender.enum';
import { SortOrder } from 'src/common/data/enums/sort-order.enum';
import { PaginationInput } from 'src/common/data/pagination/pagination.input';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import { validProduct1, validProduct2, validUUID1 } from 'src/common/testing-mocks/helper-data';

import { CategoriesService } from './../categories/categories.service';
import { ProductFiltersInput } from './dto/request/all-products/product-filters.input';
import {
  SortingProductInput,
  ProductSortableField,
} from './dto/request/all-products/sorting-product.input';
import { CreateProductInput } from './dto/request/create-product.input';
import { UpdateProductInput } from './dto/request/update-product.input';
import { ProductsService } from './products.service';

const mockPrismaServiceInit = {
  product: {
    count: jest.fn(),
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
  productVariation: {
    updateMany: jest.fn(),
  },
};

const mockProducts: Product[] = [validProduct1, validProduct2];

const productId = validUUID1;
const productData = {
  ...validProduct1,
  id: productId,
};

describe('ProductsService', () => {
  let service: ProductsService;
  let prismaService: typeof mockPrismaServiceInit;
  let categoriesService: DeepMocked<CategoriesService>;
  let productCalculatedFieldsService: DeepMocked<ProductCalculatedFieldsService>;
  let idValidatorService: DeepMocked<IdValidatorService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PrismaService, useValue: mockPrismaServiceInit },
        {
          provide: CategoriesService,
          useValue: createMock<CategoriesService>(),
        },
        {
          provide: ProductCalculatedFieldsService,
          useValue: createMock<ProductCalculatedFieldsService>(),
        },
        {
          provide: IdValidatorService,
          useValue: createMock<IdValidatorService>(),
        },
      ],
    }).compile();

    service = module.get(ProductsService);
    prismaService = module.get(PrismaService);
    categoriesService = module.get(CategoriesService);
    productCalculatedFieldsService = module.get(ProductCalculatedFieldsService);
    idValidatorService = module.get(IdValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(categoriesService).toBeDefined();
    expect(productCalculatedFieldsService).toBeDefined();
    expect(idValidatorService).toBeDefined();
  });

  describe('findOne', () => {
    it('should return a product by ID', async () => {
      const expected = {
        ...mockProducts[0],
        id: validUUID1,
      };
      idValidatorService.findUniqueProductById.mockResolvedValue(expected);

      const result = await service.findOne(validUUID1);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({
        id: validUUID1,
      });
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      idValidatorService.findUniqueProductById.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({
        id: 'nonexistent-id',
      });
    });

    it('should handle errors from idValidatorService', async () => {
      idValidatorService.findUniqueProductById.mockRejectedValue(new Error('Unexpected error'));

      await expect(service.findOne('prod-1')).rejects.toThrow('Unexpected error');

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({
        id: 'prod-1',
      });
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      prismaService.product.count.mockReset();
      prismaService.product.findMany.mockReset();
    });

    it('should return paginated products with meta', async () => {
      const filters: ProductFiltersInput = {
        gender: Gender.KIDS,
        minPrice: 100,
        maxPrice: 150,
        categoryId: validUUID1,
        search: 'Product',
      };
      const sorting: SortingProductInput = {
        field: ProductSortableField.NAME,
        order: SortOrder.ASC,
      };
      const pagination: PaginationInput = {
        page: 1,
        limit: 10,
      };

      prismaService.product.count.mockResolvedValue(1);
      prismaService.product.findMany.mockResolvedValue([mockProducts[0]]);
      const wherePrismaFilter = {
        isDeleted: false,
        isEnabled: true,
        gender: Gender.KIDS,
        minPrice: { gte: 100 },
        maxPrice: { lte: 150 },
        categoryId: validUUID1,
        name: {
          contains: 'Product',
          mode: 'insensitive',
        },
      };

      const result = await service.findAll({ filter: filters, sortBy: sorting, pagination });

      expect(prismaService.product.count).toHaveBeenCalledWith(
        expect.objectContaining({
          where: wherePrismaFilter,
        }),
      );
      //TODO: remove include after dataloader implementation
      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: wherePrismaFilter,
          orderBy: {
            name: 'asc',
          },
          skip: 0,
          take: 10,
        }),
      );
      expect(result).toEqual({
        meta: {
          page: 1,
          limit: 10,
          totalItems: expect.any(Number),
          totalPages: expect.any(Number),
        },
        collection: [mockProducts[0]],
      });
    });

    it.each([[undefined], [null]])(
      'should throw error when no inputs are provided',
      async (input: any) => {
        //Clean mocks for it.each
        prismaService.product.count.mockReset();
        prismaService.product.findMany.mockReset();

        await expect(service.findAll(input)).rejects.toThrow(UnprocessableEntityException);

        expect(prismaService.product.count).not.toHaveBeenCalled();
        expect(prismaService.product.findMany).not.toHaveBeenCalled();
      },
    );

    it.each([[undefined], [null]])(
      'should handle query with null or undefine inputs',
      async (notValidaInput: any) => {
        //Clean mocks for it.each
        prismaService.product.count.mockReset();
        prismaService.product.findMany.mockReset();

        const expectedData = [mockProducts[0], mockProducts[1]];
        prismaService.product.count.mockResolvedValue(2);
        prismaService.product.findMany.mockResolvedValue(expectedData);

        const result = await service.findAll({
          filter: notValidaInput,
          sortBy: notValidaInput,
          pagination: notValidaInput,
        });

        expect(prismaService.product.count).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              isDeleted: false,
              isEnabled: true,
            },
          }),
        );
        expect(prismaService.product.findMany).toHaveBeenCalledWith(
          expect.objectContaining({
            where: {
              isDeleted: false,
              isEnabled: true,
            },
            orderBy: {},
            skip: expect.any(Number),
            take: expect.any(Number),
          }),
        );
        expect(result).toEqual({
          meta: {
            page: 1,
            limit: 20,
            totalItems: expect.any(Number),
            totalPages: expect.any(Number),
          },
          collection: expectedData,
        });
      },
    );

    it('should adjust filters based on isManagerOrSimilar flag as true', async () => {
      const isManagerOrSimilar = true;
      const expectedData = [mockProducts[0], mockProducts[1]];

      prismaService.product.count.mockResolvedValue(2);
      prismaService.product.findMany.mockResolvedValue(expectedData);

      const result = await service.findAll(
        { filter: undefined, pagination: undefined, sortBy: undefined },
        isManagerOrSimilar,
      );

      expect(prismaService.product.count).toHaveBeenCalledWith({
        where: {},
      });

      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          orderBy: {},
          skip: 0,
          take: 20,
        }),
      );

      expect(result.meta).toEqual({
        page: 1,
        limit: 20,
        totalItems: expect.any(Number),
        totalPages: expect.any(Number),
      });
      expect(result.collection).toBe(expectedData);
    });
  });

  describe('create', () => {
    const createProductInput: CreateProductInput = {
      name: validProduct1.name,
      description: validProduct1.description,
      categoryId: validProduct1.categoryId,
      gender: validProduct1.gender,
      isEnabled: validProduct1.isEnabled,
    };

    beforeEach(async () => {
      prismaService.product.create.mockReset();
      categoriesService.doesCategoryExist.mockReset();
    });

    it('should create a new product successfully', async () => {
      const expectedCreatedProduct = validProduct1;

      categoriesService.doesCategoryExist.mockResolvedValue(true);
      prismaService.product.create.mockResolvedValue(expectedCreatedProduct);

      const result = await service.create(createProductInput);

      expect(categoriesService.doesCategoryExist).toHaveBeenCalledWith(validProduct1.categoryId);
      const { categoryId, ...rest } = createProductInput;
      expect(prismaService.product.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: {
            ...rest,
            category: {
              connect: {
                id: categoryId,
              },
            },
          },
        }),
      );

      expect(result).toEqual(expectedCreatedProduct);
    });

    it('should throw UnprocessableEntityException if categoryId is missing', async () => {
      const invalidInput = { ...createProductInput, categoryId: undefined };

      await expect(service.create(invalidInput as any)).rejects.toThrow(
        UnprocessableEntityException,
      );
      expect(categoriesService.doesCategoryExist).not.toHaveBeenCalled();
      expect(prismaService.product.create).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if category does not exist', async () => {
      categoriesService.doesCategoryExist.mockResolvedValue(false);

      await expect(service.create(createProductInput)).rejects.toThrow(NotFoundException);

      expect(categoriesService.doesCategoryExist).toHaveBeenCalledWith(
        createProductInput.categoryId,
      );
      expect(prismaService.product.create).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    beforeEach(async () => {
      prismaService.product.update.mockReset();
      categoriesService.doesCategoryExist.mockReset();
    });

    const updateProductInput: UpdateProductInput = {
      id: validProduct1.id,
      name: 'Updated Product',
      description: 'Updated Description',
      categoryId: validProduct1.categoryId,
      gender: Gender.FEMALE,
    };

    const productData = validProduct1;

    const productUpdatedData = {
      ...productData,
      ...updateProductInput,
    };

    it('should update a product successfully', async () => {
      categoriesService.doesCategoryExist.mockResolvedValue(true);
      idValidatorService.findUniqueProductById.mockResolvedValue(productData);
      prismaService.product.update.mockResolvedValue(productUpdatedData);

      const result = await service.update(updateProductInput);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({
        id: validProduct1.id,
      });
      const { categoryId, ...rest } = updateProductInput;
      expect(categoriesService.doesCategoryExist).toHaveBeenCalledWith(categoryId);
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: updateProductInput.id },
        data: {
          ...rest,
          category: {
            connect: {
              id: categoryId,
            },
          },
        },
      });

      expect(result).toEqual(productUpdatedData);
    });

    it('should update a product without changing category if categoryId is not provided', async () => {
      const partialUpdate = {
        id: productData.id,
        name: 'Partially Updated Product',
      };

      const expectedUpdatedProduct = {
        ...productData,
        ...partialUpdate,
      };

      categoriesService.doesCategoryExist.mockResolvedValue(false);
      idValidatorService.findUniqueProductById.mockResolvedValue(productData);
      prismaService.product.update.mockResolvedValue(expectedUpdatedProduct);

      const result = await service.update(partialUpdate);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({
        id: validProduct1.id,
      });
      expect(categoriesService.doesCategoryExist).not.toHaveBeenCalled();
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productData.id },
        data: {
          ...partialUpdate,
          category: {
            connect: {
              id: productData.categoryId,
            },
          },
        },
      });
      expect(result.name).toBe('Partially Updated Product');
    });

    it('should throw Error if category does not exist during update', async () => {
      const input = { ...updateProductInput, categoryId: 'cat-3' };
      idValidatorService.findUniqueProductById.mockResolvedValue(productData);
      categoriesService.doesCategoryExist.mockResolvedValue(false);

      await expect(service.update(input)).rejects.toThrow(NotFoundException);

      expect(categoriesService.doesCategoryExist).toHaveBeenCalledWith('cat-3');
      expect(idValidatorService.findUniqueProductById).not.toHaveBeenCalled();
      expect(prismaService.product.update).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      prismaService.productVariation.updateMany.mockReset();
      prismaService.product.update.mockReset();
    });

    it('should delete a product and its variations successfully', async () => {
      idValidatorService.findUniqueProductById.mockResolvedValue(productData);
      prismaService.productVariation.updateMany.mockResolvedValue({ count: 2 });
      prismaService.product.update.mockResolvedValue({
        ...productData,
        isDeleted: true,
      });

      const result = await service.delete(productId);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({ id: productId });
      expect(prismaService.productVariation.updateMany).toHaveBeenCalledWith({
        where: { productId },
        data: { isDeleted: true },
      });
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { isDeleted: true },
      });

      expect(result.isDeleted).toBeTruthy();
    });

    it('should throw NotFoundException if product does not exist during deletion', async () => {
      idValidatorService.findUniqueProductById.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(service.delete('nonexistent-id')).rejects.toThrow(NotFoundException);
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({
        id: 'nonexistent-id',
      });
      expect(prismaService.productVariation.updateMany).not.toHaveBeenCalled();
      expect(prismaService.product.update).not.toHaveBeenCalled();
    });
  });

  describe('toggleIsEnabled', () => {
    beforeEach(() => {
      prismaService.productVariation.updateMany.mockReset();
      prismaService.product.update.mockReset();
      productCalculatedFieldsService.recalculateProductMinMaxPrices.mockReset();
    });
    it('should enable a product and recalculate prices', async () => {
      idValidatorService.findUniqueProductById.mockResolvedValue(productData);
      prismaService.productVariation.updateMany.mockResolvedValue({ count: 2 });
      productCalculatedFieldsService.recalculateProductMinMaxPrices.mockResolvedValue(true);
      prismaService.product.update.mockResolvedValue({
        ...validProduct1,
        isEnabled: true,
      });

      const result = await service.toggleIsEnabled(productId, true);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({ id: productId });
      expect(prismaService.productVariation.updateMany).toHaveBeenCalledWith({
        where: { productId },
        data: { isEnabled: true },
      });
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).toHaveBeenCalledWith([
        productId,
      ]);
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { isEnabled: true },
      });

      expect(result.isEnabled).toBeTruthy();
    });

    it('should disable a product and recalculate prices', async () => {
      idValidatorService.findUniqueProductById.mockResolvedValue(productData);
      prismaService.productVariation.updateMany.mockResolvedValue({ count: 2 });
      productCalculatedFieldsService.recalculateProductMinMaxPrices.mockResolvedValue(true);
      prismaService.product.update.mockResolvedValue({
        ...validProduct1,
        isEnabled: false,
      });

      const result = await service.toggleIsEnabled(productId, false);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({ id: productId });
      expect(prismaService.productVariation.updateMany).toHaveBeenCalledWith({
        where: { productId },
        data: { isEnabled: false },
      });
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).toHaveBeenCalledWith([
        productId,
      ]);
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { isEnabled: false },
      });

      expect(result.isEnabled).toBeFalsy();
    });

    it('should throw NotFoundException if product does not exist during toggle', async () => {
      idValidatorService.findUniqueProductById.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(service.toggleIsEnabled('nonexistent-id', true)).rejects.toThrow(
        NotFoundException,
      );
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({
        id: 'nonexistent-id',
      });
      expect(prismaService.productVariation.updateMany).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
      expect(prismaService.product.update).not.toHaveBeenCalled();
    });
  });
});
