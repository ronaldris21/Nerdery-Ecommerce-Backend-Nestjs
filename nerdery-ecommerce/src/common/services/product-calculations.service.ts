import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductCalculationsService {
    constructor(private readonly prisma: PrismaService) { }

    async recalculateProductMinMaxPriceAndLikesCount(productIds: string[]) {
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
