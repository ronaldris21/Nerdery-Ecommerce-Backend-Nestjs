import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) { }

  async findBySearch(search: string) {
    if (!search) {
      return this.prisma.category.findMany({
        include: { subCategories: true, products: true },
      });
    }

    return this.prisma.category.findMany({
      where: {
        name: {
          contains: search,
          mode: 'insensitive',
        }
      },
      include: { subCategories: true, products: true },
    });
  }

  async findByIds(ids: string[]) {
    return this.prisma.category.findMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  }


}
