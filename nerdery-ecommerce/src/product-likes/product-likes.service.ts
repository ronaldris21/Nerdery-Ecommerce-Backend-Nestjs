import { Injectable } from '@nestjs/common';
import { IdValidatorService } from 'src/common/services/id-validator/id-validator.service';
import { ProductCalculatedFieldsService } from 'src/common/services/product-calculations/product-calculated-fields.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductLikesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly idValidatorService: IdValidatorService,
    private readonly productCalculatedFieldsService: ProductCalculatedFieldsService,
  ) {}
  async like(userId: string, productId: string) {
    await this.prisma.productLike.upsert({
      create: {
        productId: productId,
        userId: userId,
      },
      where: {
        userId_productId: {
          productId: productId,
          userId: userId,
        },
      },
      update: {
        productId: productId,
        userId: userId,
      },
    });

    await this.productCalculatedFieldsService.recalculateProductLikesCount([productId]);
    return await this.idValidatorService.findUniqueProductById({ id: productId }, false, false);
  }
  async dislike(userId: string, productId: string) {
    try {
      await this.prisma.productLike.delete({
        where: {
          userId_productId: {
            productId: productId,
            userId: userId,
          },
        },
      });
      await this.productCalculatedFieldsService.recalculateProductLikesCount([productId]);

      // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (error) {
      //Ignore Error
    }

    return await this.idValidatorService.findUniqueProductById({ id: productId }, false, false);
  }
}
