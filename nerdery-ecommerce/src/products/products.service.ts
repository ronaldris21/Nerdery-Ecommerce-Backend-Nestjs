import { CategoriesService } from './../categories/categories.service';
import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Gender } from 'src/common/enums/gender.enum';
import { PaginationMeta } from 'src/common/pagination/pagination-meta.object';
import { PaginationInput } from 'src/common/pagination/pagination.input';
import { PrismaService } from 'src/prisma/prisma.service';
import { ProductFiltersInput } from './dto/product-filters.input';
import { ProductSortableField, SortingProductInput } from './dto/sorting-product.input';
import { Prisma, Product } from '@prisma/client';
import { CreateProductInput } from './dto/create-product.input';
import { UpdateProductInput } from './dto/update-product.input';
import { GenericResponse } from 'src/common/dto/generic.dto';
import { ProductHelperService } from 'src/common/services/product-calculations.service';

@Injectable()
//TODO: remove include and use ResolveFields
//TODO: add DataLoaders to avoid N+1 problem on ResolveFields
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly categoriesService: CategoriesService,
    private readonly productsHelperService: ProductHelperService,
  ) { }

  async findAll(
    filters?: ProductFiltersInput,
    sorting?: SortingProductInput,
    pagination?: PaginationInput,
    isManagerOrSimilar: boolean = false,
  ) {
    const { page = 1, limit = 20 } = pagination;

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


    let collection = await this.prisma.product.findMany({
      where: where,
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true, productVariations: true },
    });

    if (!isManagerOrSimilar) {
      collection = collection.map((product) => {
        const filteredProductVariations = product.productVariations.filter(p => p.isEnabled && !p.isDeleted);
        product.productVariations = filteredProductVariations;
        return product;
      });
    }

    return {
      meta,
      collection,
    };
  }

  async findOne(id: string) {
    return this.productsHelperService.findProductByIdAndValidate({ id });
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
      throw new BadRequestException('Category is required');
    }

    if (!await this.categoriesService.doesCategoryExist(categoryId)) {
      throw new BadRequestException('Category does not exist');
    }


    return await this.prisma.product.create({
      data: {
        ...rest,
        category: {
          connect: {
            id: categoryId
          }
        },
      },
      include: { productVariations: true, category: true },
    });
  }

  async update(input: UpdateProductInput) {
    const { categoryId, ...rest } = input;

    if (categoryId) {
      if (!this.categoriesService.doesCategoryExist(categoryId)) {
        throw new Error('Category does not exist');
      }
    }

    await this.productsHelperService.findProductByIdAndValidate({ id: input.id });

    return this.prisma.product.update({
      where: { id: input.id },
      data: {
        ...rest,
        category: {
          connect: {
            id: categoryId
          }
        },
      },
      include: { productVariations: true, category: true },
    });
  }

  async delete(id: string) {
    await this.productsHelperService.findProductByIdAndValidate({ id }, false, false);

    await this.prisma.productVariation.updateMany({ where: { productId: id }, data: { isDeleted: true } });
    return await this.prisma.product.update({ where: { id }, data: { isDeleted: true } });
  }

  async toggleIsEnabled(id: string, isEnabled: boolean) {
    await this.productsHelperService.findProductByIdAndValidate({ id }, false, false);

    await this.prisma.productVariation.updateMany({ where: { productId: id }, data: { isEnabled: isEnabled } });
    if (isEnabled) {
      await this.productsHelperService.recalculateProductMinMaxPrices([id]);
    }
    return await this.prisma.product.update({ where: { id }, data: { isEnabled: isEnabled }, include: { productVariations: true } });
  }

}
