import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { TestingModule, Test } from '@nestjs/testing';
import { Prisma, ProductVariation } from '@prisma/client';
import { DiscountType } from 'src/common/data/enums/discount-type.enum';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
  ProductVariationWithProductAndImages,
  ProductWithVariationsAndCategory,
} from 'src/common/prisma-types';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import {
  validProduct1,
  validProductVariation1,
  validProductVariation2,
  validUUID1,
  validUUID2,
  validUUID4,
} from 'src/common/testing-mocks/helper-data';

import { CreateProductVariationInput } from './dto/request/create-product-variation.input';
import { UpdateProductVariationInput } from './dto/request/update-product-variation.input';
import { ProductVariationsService } from './product-variations.service';

const mockPrismaServiceInit = {
  productVariation: {
    findMany: jest.fn(),
    update: jest.fn(),
    create: jest.fn(),
  },
};
describe('ProductVariationsService', () => {
  let service: ProductVariationsService;
  let prismaService: typeof mockPrismaServiceInit;
  let productCalculatedFieldsService: DeepMocked<ProductCalculatedFieldsService>;
  let idValidatorService: DeepMocked<IdValidatorService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductVariationsService,
        { provide: PrismaService, useValue: mockPrismaServiceInit },
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

    service = module.get<ProductVariationsService>(ProductVariationsService);
    prismaService = module.get(PrismaService);
    productCalculatedFieldsService = module.get(ProductCalculatedFieldsService);
    idValidatorService = module.get(IdValidatorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(productCalculatedFieldsService).toBeDefined();
    expect(idValidatorService).toBeDefined();
  });

  const variationId = validUUID2;
  const productId = validUUID1;

  const existingVariation: ProductVariation = {
    id: variationId,
    productId: productId,
    price: new Prisma.Decimal(100.0),
    discount: new Prisma.Decimal(10.0),
    discountType: DiscountType.PERCENTAGE,
    isEnabled: true,
    isDeleted: false,
    color: 'Red',
    size: 'M',
    stock: 10,
    stockRefilledAt: new Date(),
  };

  const existingVariationWithDetails: ProductVariationWithProductAndImages = {
    ...existingVariation,
    product: validProduct1,
    variationImages: [],
  };

  const existingProduct: ProductWithVariationsAndCategory = {
    ...validProduct1,
    id: productId,
    productVariations: [],
    category: { id: validUUID1, name: 'Category ', parentCategoryId: null },
  };

  describe('findAll', () => {
    const productId = validUUID1;
    const mockVariations: ProductVariation[] = [
      {
        ...validProductVariation1,
        productId: productId,
      },
      {
        ...validProductVariation2,
        productId: productId,
      },
    ];

    it('should return all enabled and non-deleted variations for a product', async () => {
      prismaService.productVariation.findMany.mockResolvedValue(mockVariations);

      const result = await service.findAll(productId);

      expect(prismaService.productVariation.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false, isEnabled: true, productId },
        include: { product: true, variationImages: true },
      });

      expect(result).toEqual(mockVariations);
    });

    it('should return an empty array if no variations are found', async () => {
      prismaService.productVariation.findMany.mockResolvedValue([]);

      const result = await service.findAll('nonexistent-product-id');

      expect(prismaService.productVariation.findMany).toHaveBeenCalledWith({
        where: {
          isDeleted: false,
          isEnabled: true,
          productId: 'nonexistent-product-id',
        },
        include: { product: true, variationImages: true },
      });

      expect(result).toEqual([]);
    });

    it('should handle Prisma errors', async () => {
      prismaService.productVariation.findMany.mockRejectedValue(new Error('Database error'));

      await expect(service.findAll(productId)).rejects.toThrow('Database error');

      expect(prismaService.productVariation.findMany).toHaveBeenCalledWith({
        where: { isDeleted: false, isEnabled: true, productId },
        include: { product: true, variationImages: true },
      });
    });
  });

  describe('findOne', () => {
    const variationId = validUUID2;
    const mockVariation: ProductVariation = {
      ...validProductVariation1,
      productId: validUUID1,
    };

    it('should return a variation by ID', async () => {
      const expected = {
        ...mockVariation,
        product: validProduct1,
        variationImages: [],
      };
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(expected);

      const result = await service.findOne(variationId);

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith({
        id: variationId,
        isDeleted: false,
        isEnabled: true,
      });
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException if variation does not exist', async () => {
      idValidatorService.findUniqueProductVariationById.mockRejectedValue(new NotFoundException());

      await expect(service.findOne('nonexistent-variation-id')).rejects.toThrow(NotFoundException);

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith({
        id: 'nonexistent-variation-id',
        isDeleted: false,
        isEnabled: true,
      });
    });

    it('should handle errors from IdValidatorService', async () => {
      idValidatorService.findUniqueProductVariationById.mockRejectedValue(
        new Error('Unexpected error'),
      );

      await expect(service.findOne(variationId)).rejects.toThrow('Unexpected error');

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith({
        id: variationId,
        isDeleted: false,
        isEnabled: true,
      });
    });
  });

  describe('create', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    const productId = validUUID1;
    const createInput: CreateProductVariationInput = {
      productId: productId,
      price: 120.46,
      discount: 15,
      discountType: DiscountType.PERCENTAGE,
      color: 'Green',
      size: 'S',
      stock: 8,
      isEnabled: true,
    };

    const createdVariation: ProductVariation = {
      id: validUUID4,
      productId: productId,
      price: new Prisma.Decimal(120.46),
      discount: new Prisma.Decimal(15),
      discountType: DiscountType.PERCENTAGE,
      isEnabled: true,
      isDeleted: false,
      color: 'Green',
      size: 'S',
      stock: 8,
      stockRefilledAt: new Date(),
    };

    it('should create a new product variation successfully', async () => {
      idValidatorService.findUniqueProductById.mockResolvedValue(existingProduct);
      prismaService.productVariation.create.mockResolvedValue(createdVariation);
      const expected = {
        ...createdVariation,
        product: existingProduct,
        variationImages: [],
      };
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(expected);

      const result = await service.create(createInput);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith(
        { id: productId },
        false,
        false,
      );
      expect(prismaService.productVariation.create).toHaveBeenCalledWith({
        data: {
          discount: 15,
          discountType: DiscountType.PERCENTAGE,
          color: 'Green',
          size: 'S',
          stock: 8,
          price: 120.46,
          isEnabled: true,
          product: {
            connect: { id: productId },
          },
        },
      });
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).toHaveBeenCalledWith([
        productId,
      ]);
      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith({
        id: createdVariation.id,
      });
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException if product does not exist', async () => {
      idValidatorService.findUniqueProductById.mockRejectedValue(
        new NotFoundException('Product does not exist'),
      );

      await expect(service.create(createInput)).rejects.toThrow(NotFoundException);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith(
        { id: productId },
        false,
        false,
      );
      expect(prismaService.productVariation.create).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
      expect(idValidatorService.findUniqueProductVariationById).not.toHaveBeenCalled();
    });

    it('should handle Prisma errors during creation', async () => {
      idValidatorService.findUniqueProductById.mockResolvedValue(existingProduct);
      prismaService.productVariation.create.mockRejectedValue(new Error('Database error'));

      await expect(service.create(createInput)).rejects.toThrow('Database error');

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith(
        { id: productId },
        false,
        false,
      );
      expect(prismaService.productVariation.create).toHaveBeenCalledWith({
        data: {
          discount: 15,
          discountType: DiscountType.PERCENTAGE,
          color: 'Green',
          size: 'S',
          stock: 8,
          price: 120.46,
          isEnabled: true,
          product: {
            connect: { id: productId },
          },
        },
      });
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
      expect(idValidatorService.findUniqueProductVariationById).not.toHaveBeenCalled();
    });
  });

  describe('update', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const updateInput: UpdateProductVariationInput = {
      id: variationId,
      productId: productId,
      price: 110.79,
      discount: 20,
      discountType: DiscountType.PERCENTAGE,
      color: 'Yellow',
      size: 'L',
      stock: 5,
    };

    const updatedVariation: ProductVariation = {
      ...existingVariation,
      ...updateInput,
      price: new Prisma.Decimal(110.79),
      discount: new Prisma.Decimal(20),
      discountType: DiscountType.PERCENTAGE,
      stockRefilledAt: new Date(),
    };

    it('should update a product variation successfully', async () => {
      const { productId, ...rest } = updateInput;

      idValidatorService.findUniqueProductById.mockResolvedValue(existingProduct);
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        existingVariationWithDetails,
      );
      prismaService.productVariation.update.mockResolvedValue(updatedVariation);
      productCalculatedFieldsService.recalculateProductMinMaxPrices.mockResolvedValue(true);
      const expected = {
        ...updatedVariation,
        product: validProduct1,
        variationImages: [],
      };
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(expected);

      const result = await service.update(updateInput);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith(
        { id: productId },
        false,
        false,
      );
      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: variationId },
        false,
        false,
      );
      expect(prismaService.productVariation.update).toHaveBeenCalledWith({
        where: { id: variationId },
        data: {
          ...rest,
          product: {
            connect: { id: productId },
          },
        },
      });
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).toHaveBeenCalledWith([
        productId,
      ]);
      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith({
        id: variationId,
      });
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException if product does not exist during update', async () => {
      idValidatorService.findUniqueProductById.mockRejectedValue(
        new NotFoundException('Product does not exist'),
      );

      await expect(service.update(updateInput)).rejects.toThrow(NotFoundException);

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalled();
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith(
        { id: productId },
        false,
        false,
      );
      expect(prismaService.productVariation.update).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if variation does not exist during update', async () => {
      idValidatorService.findUniqueProductById.mockResolvedValue(existingProduct);
      idValidatorService.findUniqueProductVariationById.mockRejectedValue(
        new NotFoundException('Product Variation not found'),
      );

      await expect(service.update(updateInput)).rejects.toThrow(NotFoundException);

      expect(idValidatorService.findUniqueProductById).not.toHaveBeenCalled();
      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: variationId },
        false,
        false,
      );
      expect(prismaService.productVariation.update).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException for invalid percentage discount', async () => {
      const invalidUpdateInput: UpdateProductVariationInput = {
        ...updateInput,
        discount: 150, // Invalid percentage
        discountType: DiscountType.PERCENTAGE,
      };

      idValidatorService.findUniqueProductById.mockResolvedValue(existingProduct);
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        existingVariationWithDetails,
      );

      await expect(service.update(invalidUpdateInput)).rejects.toThrow(
        UnprocessableEntityException,
      );

      expect(prismaService.productVariation.update).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
    });

    it('should throw UnprocessableEntityException for invalid fixed discount', async () => {
      const invalidUpdateInput: UpdateProductVariationInput = {
        ...updateInput,
        discount: 200, // Greater than price
        discountType: DiscountType.FIXED,
      };

      idValidatorService.findUniqueProductById.mockResolvedValue(existingProduct);
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        existingVariationWithDetails,
      );

      await expect(service.update(invalidUpdateInput)).rejects.toThrow(
        UnprocessableEntityException,
      );

      expect(prismaService.productVariation.update).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
    });

    it('should handle Prisma errors during update', async () => {
      idValidatorService.findUniqueProductById.mockResolvedValue(existingProduct);
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        existingVariationWithDetails,
      );
      jest.spyOn(service, 'validateDiscount').mockReturnValue(true);
      prismaService.productVariation.update.mockRejectedValue(new Error('Database error'));

      await expect(service.update(updateInput)).rejects.toThrow('Database error');

      expect(prismaService.productVariation.update).toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
    });
  });

  describe('toggleIsEnabled', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const updatedVariation: ProductVariation = {
      ...existingVariation,
      isEnabled: false,
      stockRefilledAt: new Date(),
    };

    it('should enable a product variation and recalculate prices', async () => {
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        existingVariationWithDetails,
      );
      prismaService.productVariation.update.mockResolvedValue({
        ...existingVariation,
        isEnabled: true,
      });
      productCalculatedFieldsService.recalculateProductMinMaxPrices.mockResolvedValue(true);
      const expected = {
        ...existingVariation,
        isEnabled: true,
        product: validProduct1,
        variationImages: [],
      };
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(expected);

      const result = await service.toggleIsEnabled(variationId, true);

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: variationId },
        false,
        false,
      );
      expect(prismaService.productVariation.update).toHaveBeenCalledWith({
        where: { id: variationId },
        data: { isEnabled: true },
      });
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).toHaveBeenCalledWith([
        productId,
      ]);
      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith({
        id: variationId,
      });
      expect(result).toEqual(expected);
    });

    it('should disable a product variation and recalculate prices', async () => {
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        existingVariationWithDetails,
      );
      prismaService.productVariation.update.mockResolvedValue(updatedVariation);
      productCalculatedFieldsService.recalculateProductMinMaxPrices.mockResolvedValue(true);
      const expected = {
        ...updatedVariation,
        product: validProduct1,
        variationImages: [],
      };
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(expected);

      const result = await service.toggleIsEnabled(variationId, false);

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: variationId },
        false,
        false,
      );
      expect(prismaService.productVariation.update).toHaveBeenCalledWith({
        where: { id: variationId },
        data: { isEnabled: false },
      });
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).toHaveBeenCalledWith([
        productId,
      ]);
      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith({
        id: variationId,
      });
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException if variation does not exist during toggle', async () => {
      idValidatorService.findUniqueProductVariationById.mockRejectedValue(
        new NotFoundException('Product Variation not found'),
      );

      await expect(service.toggleIsEnabled('nonexistent-variation-id', true)).rejects.toThrow(
        NotFoundException,
      );

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: 'nonexistent-variation-id' },
        false,
        false,
      );
      expect(prismaService.productVariation.update).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
    });

    it('should handle Prisma errors during toggle', async () => {
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        existingVariationWithDetails,
      );
      prismaService.productVariation.update.mockRejectedValue(new Error('Database error'));

      await expect(service.toggleIsEnabled(variationId, true)).rejects.toThrow('Database error');

      expect(prismaService.productVariation.update).toHaveBeenCalledWith({
        where: { id: variationId },
        data: { isEnabled: true },
      });
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
    });
  });

  describe('delete', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });
    const deletedVariation: ProductVariation = {
      ...existingVariation,
      isDeleted: true,
      isEnabled: false,
      stockRefilledAt: new Date(),
    };

    it('should delete a product variation successfully and recalculate prices', async () => {
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        existingVariationWithDetails,
      );
      prismaService.productVariation.update.mockResolvedValue(deletedVariation);
      productCalculatedFieldsService.recalculateProductMinMaxPrices.mockResolvedValue(true);
      const expected = {
        ...deletedVariation,
        product: validProduct1,
        variationImages: [],
      };
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(expected);

      const result = await service.delete(variationId);

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: variationId },
        false,
        false,
      );
      expect(prismaService.productVariation.update).toHaveBeenCalledWith({
        where: { id: variationId },
        data: { isDeleted: true, isEnabled: false },
      });
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).toHaveBeenCalledWith([
        productId,
      ]);
      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith({
        id: variationId,
      });
      expect(result).toEqual(expected);
    });

    it('should throw NotFoundException if variation does not exist during deletion', async () => {
      idValidatorService.findUniqueProductVariationById.mockRejectedValue(
        new NotFoundException('Product Variation not found'),
      );

      await expect(service.delete('nonexistent-variation-id')).rejects.toThrow(NotFoundException);

      expect(idValidatorService.findUniqueProductVariationById).toHaveBeenCalledWith(
        { id: 'nonexistent-variation-id' },
        false,
        false,
      );
      expect(prismaService.productVariation.update).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
    });

    it('should handle Prisma errors during deletion', async () => {
      idValidatorService.findUniqueProductVariationById.mockResolvedValue(
        existingVariationWithDetails,
      );
      prismaService.productVariation.update.mockRejectedValue(new Error('Database error'));

      await expect(service.delete(variationId)).rejects.toThrow('Database error');

      expect(prismaService.productVariation.update).toHaveBeenCalledWith({
        where: { id: variationId },
        data: { isDeleted: true, isEnabled: false },
      });
      expect(productCalculatedFieldsService.recalculateProductMinMaxPrices).not.toHaveBeenCalled();
    });
  });

  describe('validateDiscount', () => {
    it('should return true when discount is undefined or cero', () => {
      expect(
        service.validateDiscount({
          type: DiscountType.NONE,
          price: 100,
          discount: undefined,
        }),
      ).toBe(true);

      expect(
        service.validateDiscount({
          type: DiscountType.NONE,
          price: 100,
          discount: 0,
        }),
      ).toBe(true);
    });

    it('should throw UnprocessableEntityException when type is not NONE and discount is not provided', () => {
      expect(() =>
        service.validateDiscount({
          type: DiscountType.PERCENTAGE,
          price: 100,
          discount: undefined,
        }),
      ).toThrow(UnprocessableEntityException);
      expect(() =>
        service.validateDiscount({
          type: DiscountType.FIXED,
          price: 100,
          discount: undefined,
        }),
      ).toThrow(UnprocessableEntityException);
    });

    it.each([[DiscountType.FIXED, DiscountType.NONE, DiscountType.PERCENTAGE]])(
      'should throw UnprocessableEntityException for price <= 0 or not provide',
      (discountType: DiscountType) => {
        expect(() =>
          service.validateDiscount({
            type: discountType,
            price: 0,
            discount: 0,
          }),
        ).toThrow(UnprocessableEntityException);

        expect(() =>
          service.validateDiscount({
            type: discountType,
            price: -4,
            discount: 0,
          }),
        ).toThrow(UnprocessableEntityException);

        expect(() =>
          service.validateDiscount({
            type: discountType,
            price: null,
            discount: 0,
          }),
        ).toThrow(UnprocessableEntityException);
      },
    );

    describe('Percentage Discount', () => {
      it('should return true for valid percentage discount', () => {
        expect(
          service.validateDiscount({
            type: DiscountType.PERCENTAGE,
            price: 100,
            discount: 50,
          }),
        ).toBe(true);
      });

      it('should throw UnprocessableEntityException for discount < 0', () => {
        expect(() =>
          service.validateDiscount({
            type: DiscountType.PERCENTAGE,
            price: 100,
            discount: -10,
          }),
        ).toThrow(UnprocessableEntityException);

        expect(() =>
          service.validateDiscount({
            type: DiscountType.FIXED,
            price: 100,
            discount: -10,
          }),
        ).toThrow(UnprocessableEntityException);
      });
    });

    describe('Fixed Discount', () => {
      it('should return true for valid fixed discount', () => {
        expect(
          service.validateDiscount({
            type: DiscountType.FIXED,
            price: 100,
            discount: 20,
          }),
        ).toBe(true);
      });

      it.each([-10, 0, 110])(
        'should throw UnprocessableEntityException when discount < 0 || discount >= price',
        (discount: number) => {
          expect(() =>
            service.validateDiscount({
              type: DiscountType.FIXED,
              price: 100,
              discount: discount,
            }),
          ).toThrow(UnprocessableEntityException);
        },
      );
    });
  });
});
