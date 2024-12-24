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

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService, private readonly categoriesService: CategoriesService) { }

  async findAll(
    filters?: ProductFiltersInput,
    sorting?: SortingProductInput,
    pagination?: PaginationInput,
  ) {
    const { page = 1, limit = 20 } = pagination;

    const where = { isDeleted: false, isEnabled: true };
    if (filters) {
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

  async findOne(id: string) {
    return this.findByIdAndValidate({ id });
  }

  async findByIdAndValidate(where: Prisma.ProductWhereUniqueInput, includeCategory: boolean = true, includeVariations: boolean = true) {
    const product = this.prisma.product.findUnique({
      where,
      include: { category: includeCategory, productVariations: includeVariations },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    return product;
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
        //Default values
        thumbnailUrl: '',
        isDeleted: false,
        likesCount: 0,
        minPrice: 0,
        maxPrice: 0,
      }
    });
  }

  async update(input: UpdateProductInput) {
    const { categoryId, ...rest } = input;

    if (categoryId) {
      if (!this.categoriesService.doesCategoryExist(categoryId)) {
        throw new Error('Category does not exist');
      }
    }

    await this.findByIdAndValidate({ id: input.id });

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
    });
  }

  async delete(id: string) {

    await this.findByIdAndValidate({ id });

    await this.prisma.productVariation.updateMany({ where: { productId: id }, data: { isDeleted: true } });
    return await this.prisma.product.update({ where: { id }, data: { isDeleted: true } });
  }

  async toggleIsEnabled(id: string, isEnabled: boolean) {

    await this.findByIdAndValidate({ id });

    await this.prisma.productVariation.updateMany({ where: { productId: id }, data: { isEnabled: isEnabled } });
    if (isEnabled) {
      await this.recalculateMinMaxPriceAndLikesCount([id]);
    }
    return await this.prisma.product.update({ where: { id }, data: { isEnabled: isEnabled }, include: { productVariations: true } });
  }


  //TODO: maybe move to another service?
  async recalculateMinMaxPriceAndLikesCount(productIds: string[]) {
    //each id has to exists
    const products = await this.prisma.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
      include: { productVariations: true, productLikes: true },
    });

    const updatePromises = products.map(async (product) => {

      const filteredProductVariations = product.productVariations.filter(p => p.isEnabled && !p.isDeleted);
      const prices = filteredProductVariations.map(p => Number(p.price));

      //TODO: Validate cart can't have a product without variations or with price being 0.00
      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

      let calculatedData = {};
      if (minPrice) calculatedData['minPrice'] = minPrice;
      if (maxPrice) calculatedData['maxPrice'] = maxPrice;
      calculatedData['likesCount'] = product.productLikes.length;

      await this.prisma.product.update({
        where: { id: product.id },
        data: calculatedData,
      });
    });

    await Promise.all(updatePromises);

  }




}