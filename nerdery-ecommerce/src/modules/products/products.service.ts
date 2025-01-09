import { Injectable, NotFoundException, UnprocessableEntityException } from '@nestjs/common';
import { Gender } from 'src/common/data/enums/gender.enum';
import { PaginationMeta } from 'src/common/data/pagination/pagination-meta.object';
import { PaginationInput } from 'src/common/data/pagination/pagination.input';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';

import { CategoriesService } from './../categories/categories.service';
import { CreateProductInput } from './dto/request/create-product.input';
import { ProductFiltersInput } from './dto/request/product-filters.input';
import { ProductSortableField, SortingProductInput } from './dto/request/sorting-product.input';
import { UpdateProductInput } from './dto/request/update-product.input';

@Injectable()
//TODO: remove include and use ResolveFields
//TODO: add DataLoaders to avoid N+1 problem on ResolveFields
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
    private readonly productCalculatedFieldsService: ProductCalculatedFieldsService,
    private readonly idValidatorService: IdValidatorService,
  ) {}

  async findAll(
    filters?: ProductFiltersInput,
    sorting?: SortingProductInput,
    pagination?: PaginationInput,
    isManagerOrSimilar: boolean = false,
  ) {
    const page = pagination?.page ?? 1;
    const limit = pagination?.limit ?? 20;

    const where = { isDeleted: false, isEnabled: true };
    if (isManagerOrSimilar) {
      delete where.isDeleted;
      delete where.isEnabled;
    }

    if (filters) {
      if (filters.gender) {
        if (filters.gender !== Gender.UNISEX) {
          where['gender'] = filters.gender;
        }
      }
      if (filters.minPrice) {
        where['minPrice'] = { gte: filters.minPrice };
      } else {
        if (!isManagerOrSimilar) {
          //We dont want to show products with 0 price to clients or general public
          where['minPrice'] = { gt: 0 };
        }
      }
      if (filters.maxPrice) {
        where['maxPrice'] = { lte: filters.maxPrice };
      }
      if (filters.categoryId) {
        where['categoryId'] = filters.categoryId;
      }
      if (filters.search) {
        where['name'] = {
          contains: filters.search,
          mode: 'insensitive',
        };
      }
    }

    let orderBy = {};
    if (sorting) {
      if (sorting.field !== ProductSortableField.PRICE)
        orderBy = {
          [sorting.field]: sorting.order,
        };
      else {
        orderBy = {
          minPrice: sorting.order,
        };
      }
    }

    const totalItems = await this.prisma.product.count({ where });
    const totalPages = Math.ceil(totalItems / limit);
    const meta: PaginationMeta = {
      page,
      limit,
      totalItems,
      totalPages,
    };

    const collection = await this.prisma.product.findMany({
      where: where,
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      meta,
      collection,
    };
  }

  async findOne(id: string) {
    return this.idValidatorService.findUniqueProductById({ id });
  }

  async findByIds(ids: string[]) {
    return await this.prisma.product.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }

  async findByCategoryIds(categoryIds: string[]) {
    return await this.prisma.product.findMany({
      where: {
        categoryId: {
          in: categoryIds,
        },
      },
    });
  }

  async create(input: CreateProductInput) {
    const { categoryId, ...rest } = input;

    if (!categoryId) {
      throw new UnprocessableEntityException('Category is required');
    }

    if (!(await this.categoriesService.doesCategoryExist(categoryId))) {
      throw new NotFoundException('Category does not exist');
    }

    return await this.prisma.product.create({
      data: {
        ...rest,
        category: {
          connect: {
            id: categoryId,
          },
        },
      },
    });
  }

  async update(input: UpdateProductInput) {
    const { categoryId, ...rest } = input;

    if (categoryId) {
      if (!(await this.categoriesService.doesCategoryExist(categoryId))) {
        throw new NotFoundException('Category does not exist');
      }
    }

    const prod = await this.idValidatorService.findUniqueProductById({
      id: input.id,
    });
    const categoryIdUpdate = categoryId || prod.categoryId;

    return this.prisma.product.update({
      where: { id: input.id },
      data: {
        ...rest,
        category: {
          connect: {
            id: categoryIdUpdate,
          },
        },
      },
    });
  }

  async delete(id: string) {
    await this.idValidatorService.findUniqueProductById({ id });

    await this.prisma.productVariation.updateMany({
      where: { productId: id },
      data: { isDeleted: true },
    });
    return await this.prisma.product.update({
      where: { id },
      data: { isDeleted: true },
    });
  }

  async toggleIsEnabled(id: string, isEnabled: boolean) {
    await this.idValidatorService.findUniqueProductById({ id });

    await this.prisma.productVariation.updateMany({
      where: { productId: id },
      data: { isEnabled: isEnabled },
    });
    await this.productCalculatedFieldsService.recalculateProductMinMaxPrices([id]);
    return await this.prisma.product.update({
      where: { id },
      data: { isEnabled: isEnabled },
    });
  }
}
