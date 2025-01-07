import {
  CartItem,
  Category,
  Product,
  ProductLike,
  ProductVariation,
  VariationImage,
} from '@prisma/client';

export type ProductWithVariations = Product & {
  productVariations: ProductVariation[];
};
export type ProductWithVariationsAndCategory = Product & {
  productVariations: ProductVariation[];
  category: Category;
};
export type ProductWithLikes = Product & { productLikes: ProductLike[] };
export type CartItemWithProductVariation = CartItem & {
  productVariation: ProductVariation;
};
export type ProductVariationWithProductAndImages = ProductVariation & {
  product: Product;
  variationImages: VariationImage[];
};

export type CartItemWithFullDetails = CartItem & {
  productVariation: ProductVariationWithProductAndImages;
};

export type ProductVariationWithImagesAndProduct = ProductVariation & {
  product: Product;
  variationImages: VariationImage[];
};
