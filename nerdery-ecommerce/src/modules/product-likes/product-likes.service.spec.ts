import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Product } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import { validProduct1, validUUID7 } from 'src/common/testing-mocks/helper-data';

import { ProductLikesService } from './product-likes.service';

const mockPrismaService = {
  productLike: {
    upsert: jest.fn(),
    delete: jest.fn(),
  },
};

describe('ProductLikesService', () => {
  let service: ProductLikesService;
  let prismaService: typeof mockPrismaService;
  let idValidatorService: DeepMocked<IdValidatorService>;
  let productCalculatedFieldsService: DeepMocked<ProductCalculatedFieldsService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductLikesService,
        { provide: PrismaService, useValue: mockPrismaService },
        {
          provide: IdValidatorService,
          useValue: createMock<IdValidatorService>(),
        },
        {
          provide: ProductCalculatedFieldsService,
          useValue: createMock<ProductCalculatedFieldsService>(),
        },
      ],
    }).compile();

    service = module.get<ProductLikesService>(ProductLikesService);
    prismaService = module.get(PrismaService);
    idValidatorService = module.get(IdValidatorService);
    productCalculatedFieldsService = module.get(ProductCalculatedFieldsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(idValidatorService).toBeDefined();
    expect(productCalculatedFieldsService).toBeDefined();
  });

  const userId = validUUID7;
  const productId = validProduct1.id;
  const mockProduct: Product = validProduct1;

  describe('like', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should like a product successfully when the user has not liked it before', async () => {
      prismaService.productLike.upsert.mockResolvedValue({
        userId,
        productId,
      });
      productCalculatedFieldsService.recalculateProductLikesCount.mockResolvedValue();
      idValidatorService.findUniqueProductById.mockResolvedValue(mockProduct as any);

      const result = await service.like(userId, productId);

      expect(prismaService.productLike.upsert).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {
          productId,
          userId,
        },
        create: {
          productId,
          userId,
        },
      });
      expect(productCalculatedFieldsService.recalculateProductLikesCount).toHaveBeenCalledWith([
        productId,
      ]);
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({ id: productId });
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockProduct);
    });

    it('should like a product successfully when the user has already liked it (upsert)', async () => {
      prismaService.productLike.upsert.mockResolvedValue({
        userId,
        productId,
      });
      productCalculatedFieldsService.recalculateProductLikesCount.mockResolvedValue();
      idValidatorService.findUniqueProductById.mockResolvedValue(mockProduct as any);

      const result = await service.like(userId, productId);

      expect(prismaService.productLike.upsert).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {
          productId,
          userId,
        },
        create: {
          productId,
          userId,
        },
      });
      expect(productCalculatedFieldsService.recalculateProductLikesCount).toHaveBeenCalledWith([
        productId,
      ]);
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({ id: productId });
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockProduct);
    });

    it('should throw a error if product does not exist', async () => {
      idValidatorService.findUniqueProductById.mockRejectedValue(
        new NotFoundException('product not found'),
      );

      await expect(service.like(userId, productId)).rejects.toThrow(NotFoundException);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledTimes(1);
      expect(prismaService.productLike.upsert).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductLikesCount).not.toHaveBeenCalled();
    });

    it('should throw a error if product is deleted', async () => {
      const deletedProduct = { ...validProduct1, isDeleted: true };
      idValidatorService.findUniqueProductById.mockResolvedValue(deletedProduct);

      await expect(service.like(userId, productId)).rejects.toThrow(ConflictException);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledTimes(1);
      expect(prismaService.productLike.upsert).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductLikesCount).not.toHaveBeenCalled();
    });

    it('should throw a error if product is disable', async () => {
      const disabledProduct = { ...validProduct1, isEnabled: false };
      idValidatorService.findUniqueProductById.mockResolvedValue(disabledProduct);

      await expect(service.like(userId, productId)).rejects.toThrow(ConflictException);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledTimes(1);
      expect(prismaService.productLike.upsert).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductLikesCount).not.toHaveBeenCalled();
    });

    it('should handle Prisma errors by throwing the error', async () => {
      idValidatorService.findUniqueProductById.mockResolvedValue(validProduct1);
      prismaService.productLike.upsert.mockRejectedValue(new Error('Database error'));

      await expect(service.like(userId, productId)).rejects.toThrow('Database error');

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledTimes(1);
      expect(prismaService.productLike.upsert).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
        update: {
          productId,
          userId,
        },
        create: {
          productId,
          userId,
        },
      });
      expect(productCalculatedFieldsService.recalculateProductLikesCount).not.toHaveBeenCalled();
    });
  });

  describe('dislike', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should dislike a product successfully when the user has liked it before', async () => {
      prismaService.productLike.delete.mockResolvedValue({
        userId,
        productId,
      });
      productCalculatedFieldsService.recalculateProductLikesCount.mockResolvedValue();
      idValidatorService.findUniqueProductById.mockResolvedValue(mockProduct as any);

      const result = await service.dislike(userId, productId);

      expect(prismaService.productLike.delete).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });
      expect(productCalculatedFieldsService.recalculateProductLikesCount).toHaveBeenCalledWith([
        productId,
      ]);
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({ id: productId });
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockProduct);
    });

    it('should handle dislike when the user has not liked the product, just return the current product and not recalculated the likes count', async () => {
      prismaService.productLike.delete.mockRejectedValue(new Error('Record not found'));
      productCalculatedFieldsService.recalculateProductLikesCount.mockResolvedValue();
      idValidatorService.findUniqueProductById.mockResolvedValue(mockProduct as any);

      const result = await service.dislike(userId, productId);

      expect(prismaService.productLike.delete).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });
      expect(productCalculatedFieldsService.recalculateProductLikesCount).not.toHaveBeenCalled();
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({ id: productId });
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledTimes(2);
      expect(result).toEqual(mockProduct);
    });

    it('should throw a error if product does not exist', async () => {
      idValidatorService.findUniqueProductById.mockRejectedValue(
        new NotFoundException('product not found'),
      );

      await expect(service.dislike(userId, productId)).rejects.toThrow(NotFoundException);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledTimes(1);
      expect(prismaService.productLike.delete).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductLikesCount).not.toHaveBeenCalled();
    });

    it('should throw a error if product is deleted', async () => {
      const deletedProduct = { ...validProduct1, isDeleted: true };
      idValidatorService.findUniqueProductById.mockResolvedValue(deletedProduct);

      await expect(service.dislike(userId, productId)).rejects.toThrow(ConflictException);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledTimes(1);
      expect(prismaService.productLike.delete).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductLikesCount).not.toHaveBeenCalled();
    });

    it('should throw a error if product is disable', async () => {
      const disabledProduct = { ...validProduct1, isEnabled: false };
      idValidatorService.findUniqueProductById.mockResolvedValue(disabledProduct);

      await expect(service.dislike(userId, productId)).rejects.toThrow(ConflictException);

      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledTimes(1);
      expect(prismaService.productLike.delete).not.toHaveBeenCalled();
      expect(productCalculatedFieldsService.recalculateProductLikesCount).not.toHaveBeenCalled();
    });

    it('should handle Prisma errors during dislike operation, just ignore the error', async () => {
      prismaService.productLike.delete.mockRejectedValue(new Error('Database error'));
      productCalculatedFieldsService.recalculateProductLikesCount.mockResolvedValue();
      idValidatorService.findUniqueProductById.mockResolvedValue(mockProduct as any);

      const result = await service.dislike(userId, productId);

      expect(prismaService.productLike.delete).toHaveBeenCalledWith({
        where: {
          userId_productId: {
            userId,
            productId,
          },
        },
      });
      expect(productCalculatedFieldsService.recalculateProductLikesCount).not.toHaveBeenCalled();
      expect(idValidatorService.findUniqueProductById).toHaveBeenCalledWith({ id: productId });
      expect(result).toEqual(mockProduct);
    });
  });
});
