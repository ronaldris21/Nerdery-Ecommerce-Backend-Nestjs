import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ProductHelperService {
    constructor(private readonly prisma: PrismaService) { }

    async recalculateProductMinMaxPrices(productIds: string[]) {

        console.log('\n\nproductIds', productIds);

        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
                isDeleted: false,
                isEnabled: true,
            },
            include: { productVariations: true },
        });

        console.log('\n\nproducts', products);

        const updatePromises = products.map(async (product) => {

            const filteredProductVariations = product.productVariations.filter(p => p.isEnabled && !p.isDeleted);
            const prices = filteredProductVariations.map(p => Number(p.price));

            //TODO: Validate cart can't have a product without variations or with price being 0.00
            const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
            const maxPrice = prices.length > 0 ? Math.max(...prices) : 0;

            let calculatedData = {};
            if (minPrice) calculatedData['minPrice'] = minPrice;
            if (maxPrice) calculatedData['maxPrice'] = maxPrice;

            await this.prisma.product.update({
                where: { id: product.id },
                data: calculatedData,
            });
            console.log('\ncalculatedData', calculatedData);
        });

        const result = await Promise.allSettled(updatePromises);
        console.log('\n\nallSettled', result);
    }

    async recalculateProductLikesCount(productIds: string[]) {
        const products = await this.prisma.product.findMany({
            where: {
                id: {
                    in: productIds,
                },
                isDeleted: false,
                isEnabled: true,
            },
            include: { productLikes: true },
        });

        const updatePromises = products.map(async (product) => {
            let calculatedData = { likesCount: product.productLikes.length };
            await this.prisma.product.update({
                where: { id: product.id },
                data: calculatedData,
            });
        });
        await Promise.all(updatePromises);
    }

    async findProductByIdAndValidate(where: Prisma.ProductWhereUniqueInput, includeCategory: boolean = true, includeVariations: boolean = true) {
        const product = await this.prisma.product.findUnique({
            where,
            include: { category: includeCategory, productVariations: includeVariations },
        });

        if (!product) {
            throw new NotFoundException('Product not found');
        }

        return product;
    }

}
