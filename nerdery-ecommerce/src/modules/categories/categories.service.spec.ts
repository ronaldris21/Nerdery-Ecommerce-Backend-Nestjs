import { Test, TestingModule } from '@nestjs/testing';
import { Category } from '@prisma/client';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { validUUID1, validUUID2 } from 'src/common/testing-mocks/helper-data';

import { CategoriesService } from './categories.service';

const mockPrismaService = {
  category: {
    findMany: jest.fn(),
    count: jest.fn(),
  },
};

describe('CategoriesService', () => {
  let service: CategoriesService;
  let prismaService: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CategoriesService, { provide: PrismaService, useValue: mockPrismaService }],
    }).compile();

    service = module.get<CategoriesService>(CategoriesService);
    prismaService = module.get(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
  });

  const mockCategories: Category[] = [
    {
      id: validUUID1,
      name: 'Shorts',
      parentCategoryId: null,
    },
    {
      id: validUUID2,
      name: 'Jackets',
      parentCategoryId: null,
    },
  ];

  describe('findBySearch', () => {
    it('should return all categories when search is empty', async () => {
      prismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findBySearch('');

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        include: { subCategories: true, products: true },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should return matching categories when search is provided', async () => {
      const search = 'Jacke';
      const filteredCategories = [mockCategories[0]];
      prismaService.category.findMany.mockResolvedValue(filteredCategories);

      const result = await service.findBySearch(search);

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        include: { subCategories: true, products: true },
      });
      expect(result).toEqual(filteredCategories);
    });

    it('should return an empty array when no categories match the search', async () => {
      const search = 'NonExistent';
      prismaService.category.findMany.mockResolvedValue([]);

      const result = await service.findBySearch(search);

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
        include: { subCategories: true, products: true },
      });
      expect(result).toEqual([]);
    });
  });

  describe('findByIds', () => {
    it('should return categories matching the provided IDs', async () => {
      const ids = [validUUID1, validUUID2];
      prismaService.category.findMany.mockResolvedValue(mockCategories);

      const result = await service.findByIds(ids);

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ids,
          },
        },
      });
      expect(result).toEqual(mockCategories);
    });

    it('should return only the categories that exist among the provided IDs', async () => {
      const ids = [validUUID1, 'cat-3']; // 'cat-3' does not exist
      const existingCategories = [mockCategories[0]];
      prismaService.category.findMany.mockResolvedValue(existingCategories);

      const result = await service.findByIds(ids);

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ids,
          },
        },
      });
      expect(result).toEqual(existingCategories);
    });

    it('should return an empty array when no IDs match any categories', async () => {
      const ids = ['cat-3', 'cat-4'];
      prismaService.category.findMany.mockResolvedValue([]);

      const result = await service.findByIds(ids);

      expect(prismaService.category.findMany).toHaveBeenCalledWith({
        where: {
          id: {
            in: ids,
          },
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('doesCategoryExist', () => {
    it('should return true if the category exists', async () => {
      const categoryId = validUUID1;
      prismaService.category.count.mockResolvedValue(1);

      const result = await service.doesCategoryExist(categoryId);

      expect(prismaService.category.count).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(result).toBeTruthy();
    });

    it('should return false if the category does not exist', async () => {
      const categoryId = 'cat-3';
      prismaService.category.count.mockResolvedValue(0);

      const result = await service.doesCategoryExist(categoryId);

      expect(prismaService.category.count).toHaveBeenCalledWith({
        where: { id: categoryId },
      });
      expect(result).toBeFalsy();
    });
  });
});
