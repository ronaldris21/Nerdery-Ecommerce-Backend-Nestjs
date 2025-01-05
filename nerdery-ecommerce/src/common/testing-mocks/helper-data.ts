import { Category, Product, Prisma, ProductVariation, CartItem } from '@prisma/client';

import { DiscountType } from '../enums/discount-type.enum';
import { Gender } from '../enums/gender.enum';

// NOTE: TEST DEPENDS OF THIS FILES!
// * DO NOT REMOVE!
// * DO NOT MODIFY!

// * You can ONLY ADD NEW DATA TO BE EXPORTED!

// EXPORTS
export const validUUID1 = '773a308c-6170-4fb8-9843-144e68cd6d11';
export const validUUID2 = '773a308c-6170-4fb8-9843-144e68cd6d22';
export const validUUID3 = '773a308c-6170-4fb8-9843-144e68cd6d33';
export const validUUID4 = '773a308c-6170-4fb8-9843-144e68cd6d44';
export const validUUID5 = '773a308c-6170-4fb8-9843-144e68cd6d55';
export const validUUID6 = '773a308c-6170-4fb8-9843-144e68cd6d66';
export const validUUID7 = '773a308c-6170-4fb8-9843-144e68cd6d77';
export const validUUID8 = '773a308c-6170-4fb8-9843-144e68cd6d88';
export const validUUID9 = '773a308c-6170-4fb8-9843-144e68cd6d99';

export const validCategory: Category = {
  id: validUUID1,
  name: 'Category',
  parentCategoryId: null,
};

export const validProduct1: Product = {
  id: validUUID2,
  categoryId: validUUID1,
  gender: Gender.KIDS,
  description: 'A nice product',
  name: 'Product',
  thumbnailUrl: 'http://thumbnail.url',
  isDeleted: false,
  isEnabled: true,
  minPrice: new Prisma.Decimal(100.0),
  maxPrice: new Prisma.Decimal(150.0),
  likesCount: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const validProduct2: Product = {
  id: validUUID3,
  categoryId: validUUID1,
  gender: Gender.KIDS,
  description: 'A nice product',
  name: 'Product',
  thumbnailUrl: 'http://thumbnail.url',
  isDeleted: false,
  isEnabled: true,
  minPrice: new Prisma.Decimal(100.0),
  maxPrice: new Prisma.Decimal(150.0),
  likesCount: 5,
  createdAt: new Date(),
  updatedAt: new Date(),
};

export const validProductVariation1: ProductVariation = {
  id: validUUID4,
  productId: validUUID2,
  price: new Prisma.Decimal(100.0),
  discount: new Prisma.Decimal(0),
  discountType: DiscountType.PERCENTAGE,
  isEnabled: true,
  isDeleted: false,
  color: 'Red',
  size: 'M',
  stock: 10,
  stockRefilledAt: new Date(),
};
export const validProductVariation2: ProductVariation = {
  id: validUUID5,
  productId: validUUID2,
  price: new Prisma.Decimal(100.0),
  discount: new Prisma.Decimal(0),
  discountType: DiscountType.PERCENTAGE,
  isEnabled: true,
  isDeleted: false,
  color: 'Red',
  size: 'M',
  stock: 10,
  stockRefilledAt: new Date(),
};

// Carts
export const validCart: CartItem = {
  userId: validUUID1,
  productVariationId: validUUID2,
  quantity: 1,
};
