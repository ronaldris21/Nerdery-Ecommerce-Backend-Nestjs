import { Injectable } from '@nestjs/common';
import { Gender } from 'src/common/enums/gender.enum';
import { PaginationMeta } from 'src/common/pagination/pagination-meta.object';
import { PaginationInput } from 'src/common/pagination/pagination.input';
import { PrismaService } from 'src/prisma/prisma.service';

import { ProductFiltersInput } from './dto/product-filters.input';
import { ProductSortableField, SortingProductInput } from './dto/sorting-product.input';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) { }

  //TODO: change this any to a proper type
  async findAll(
    filters?: ProductFiltersInput,
    sorting?: SortingProductInput,
    pagination?: PaginationInput,
  ): Promise<any> {
    const { page = 1, limit = 20 } = pagination;

    ///FILTERS IS CUSTOM FOR: gender, minPrice,MaxPrice, category, brand, color, size, rating
    const where = { isDeleted: false, isEnabled: true };
    if (filters) {
      //TODO: add more filters in a generic way if it matches the field name exactly
      if (filters.gender) {
        if (filters.gender !== Gender.UNISEX) {
          where['gender'] = filters.gender;
        }
      }
      if (filters.minPrice) {
        where['minPrice'] = { gte: filters.minPrice };
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

    console.log('meta', meta);

    //TODO: remove include and use ResolveFields
    //TODO: add DataLoaders to avoid N+1 problem on ResolveFields
    const collection = await this.prisma.product.findMany({
      where: where,
      orderBy: orderBy,
      skip: (page - 1) * limit,
      take: limit,
      include: { category: true, productVariations: true },
    });

    return {
      meta,
      collection,
    };
  }

  async findById(id: string) {
    const where = { isDeleted: false, isEnabled: true };

    return this.prisma.product.findUnique({
      where: { ...where, id },
      include: { category: true, productVariations: true },
    });
  }
}
