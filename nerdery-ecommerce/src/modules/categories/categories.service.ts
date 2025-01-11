import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';

import { CategoryObject } from './entities/category.entity';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findBySearch(search: string): Promise<CategoryObject[]> {
    if (!search) {
      return this.prisma.category.findMany({
        include: { subCategories: true },
      });
    }

    return this.prisma.category.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        },
      },
      include: { subCategories: true },
    });
  }

  async doesCategoryExist(id: string): Promise<boolean> {
    return (
      (await this.prisma.category.count({
        where: {
          id,
        },
      })) > 0
    );
  }
}
