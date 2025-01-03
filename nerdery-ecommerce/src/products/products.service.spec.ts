import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Product, Category, ProductVariation } from '@prisma/client';
import { Gender } from 'src/common/enums/gender.enum';
import { SortOrder } from 'src/common/enums/sort-order.enum';
import { PaginationInput } from 'src/common/pagination/pagination.input';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import {
  validCategory,
  validProduct1,
  validProduct2,
  validProductVariation1,
  validProductVariation2,
  validUUID1,
} from 'src/common/testing-mocks/helper-data';
import { PrismaService } from 'src/prisma/prisma.service';

import { CategoriesService } from './../categories/categories.service';
import { CreateProductInput } from './dto/create-product.input';
import { ProductFiltersInput } from './dto/product-filters.input';
import { SortingProductInput, ProductSortableField } from './dto/sorting-product.input';
import { UpdateProductInput } from './dto/update-product.input';
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

const mockCategories: Category[] = [validCategory];

const mockProductVariations: ProductVariation[] = [validProductVariation1, validProductVariation2];
const productId = validUUID1;
const productData = {
  ...validProduct1,
  id: productId,
  category: mockCategories[0],
  productVariations: [validProductVariation1],
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
        { provide: CategoriesService, useValue: createMock<CategoriesService>() },
        {
          provide: ProductCalculatedFieldsService,
          useValue: createMock<ProductCalculatedFieldsService>(),
        },
        { provide: IdValidatorService, useValue: createMock<IdValidatorService>() },
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
        category: mockCategories[0],
        productVariations: [mockProductVariations[0]],
      };
      idValidatorService.findUniqueProductById.mockResolvedValue(expected);

      const result = await service.findOne(validUUID1);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({ id: validUUID1 });
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

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({ id: 'prod-1' });
    });
  });

  describe('findByIds', () => {
    it('should return products by their IDs', async () => {
      prismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findByIds(['prod-1', 'prod-2']);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['prod-1', 'prod-2'],
          },
        },
      });
      expect(result).toEqual(mockProducts);
    });

    it('should return an empty array if no products match the IDs', async () => {
      prismaService.product.findMany.mockResolvedValue([]);

      const result = await service.findByIds(['nonexistent-id']);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ['nonexistent-id'],
          },
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('findByCategoryIds', () => {
    it('should return products by category IDs', async () => {
      prismaService.product.findMany.mockResolvedValue(mockProducts);

      const result = await service.findByCategoryIds([validUUID1]);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: {
            in: [validUUID1],
          },
        },
      });

      expect(result).toEqual(mockProducts);
    });

    it('should return an empty array if no products match the category IDs', async () => {
      prismaService.product.findMany.mockResolvedValue([]);

      const result = await service.findByCategoryIds(['nonexistent-cat']);

      expect(prismaService.product.findMany).toHaveBeenCalledWith({
        where: {
          categoryId: {
            in: ['nonexistent-cat'],
          },
        },
      });

      expect(result).toEqual([]);
    });
  });

  describe('findAll', () => {
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
      prismaService.product.findMany.mockResolvedValue([
        {
          ...mockProducts[0],
          category: mockCategories[0],
          productVariations: [mockProductVariations[0]],
        },
      ]);
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

      const result = await service.findAll(filters, sorting, pagination);

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
          include: {
            category: true,
            productVariations: {
              include: { variationImages: true },
            },
          },
        }),
      );
      expect(result).toEqual({
        meta: {
          page: 1,
          limit: 10,
          totalItems: expect.any(Number),
          totalPages: expect.any(Number),
        },
        collection: [
          {
            ...mockProducts[0],
            category: mockCategories[0],
            productVariations: [mockProductVariations[0]],
          },
        ],
      });
    });

    it('should handle default pagination and no filters', async () => {
      const expectedData = [
        {
          ...mockProducts[0],
          category: mockCategories[0],
          productVariations: [mockProductVariations[0]],
        },
        {
          ...mockProducts[1],
          category: mockCategories[1],
          productVariations: [mockProductVariations[1]],
        },
      ];
      prismaService.product.count.mockResolvedValue(2);
      prismaService.product.findMany.mockResolvedValue(expectedData);

      const result = await service.findAll(undefined, undefined, undefined);

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
    });

    it('should adjust filters based on isManagerOrSimilar flag as true', async () => {
      const isManagerOrSimilar = true;
      const expectedData = [
        {
          ...mockProducts[0],
          category: mockCategories[0],
          productVariations: [mockProductVariations[0]],
        },
        {
          ...mockProducts[1],
          category: mockCategories[1],
          productVariations: [mockProductVariations[1]],
        },
      ];

      prismaService.product.count.mockResolvedValue(2);
      prismaService.product.findMany.mockResolvedValue(expectedData);

      const result = await service.findAll(undefined, undefined, undefined, isManagerOrSimilar);

      expect(prismaService.product.count).toHaveBeenCalledWith({
        where: {},
      });

      //TODO: remove include after dataloader implementation
      expect(prismaService.product.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {},
          orderBy: {},
          skip: 0,
          take: 20,
          include: {
            category: true,
            productVariations: {
              include: { variationImages: true },
            },
          },
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
      const expectedCreatedProduct = {
        ...validProduct1,
        category: validCategory,
        productVariations: [],
      };

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
          include: { productVariations: true, category: true },
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

    const productData = {
      ...validProduct1,
      category: mockCategories[0],
      productVariations: [validProductVariation1],
    };

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
        include: { productVariations: true, category: true },
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
        include: { productVariations: true, category: true },
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

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith(
        { id: productId },
        false,
        false,
      );
      expect(prismaService.productVariation.updateMany).toHaveBeenCalledWith({
        where: { productId },
        data: { isDeleted: true },
      });
      expect(prismaService.product.update).toHaveBeenCalledWith({
        where: { id: productId },
        data: { isDeleted: true },
      });

      expect(result.isDeleted).toBe(true);
    });

    it('should throw NotFoundException if product does not exist during deletion', async () => {
      idValidatorService.findUniqueProductById.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(service.delete('nonexistent-id')).rejects.toThrow(NotFoundException);
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith(
        { id: 'nonexistent-id' },
        false,
        false,
      );
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

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith(
        { id: productId },
        false,
        false,
      );
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
        include: { productVariations: true },
      });

      expect(result.isEnabled).toBe(true);
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

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith(
        { id: productId },
        false,
        false,
      );
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
        include: { productVariations: true },
      });

      expect(result.isEnabled).toBe(false);
    });

    it('should throw NotFoundException if product does not exist during toggle', async () => {
      idValidatorService.findUniqueProductById.mockRejectedValue(
        new NotFoundException('Product not found'),
      );

      await expect(service.toggleIsEnabled('nonexistent-id', true)).rejects.toThrow(
        NotFoundException,
      );
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith(
        { id: 'nonexistent-id' },
        false,
        false,
      );
      expect(prismaService.productVariation.updateMany).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
      expect(prismaService.product.update).not.toHaveBeenCalled();
    });
  });
});
