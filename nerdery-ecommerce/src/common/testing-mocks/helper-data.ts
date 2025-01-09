import {
  Category,
  Product,
  Prisma,
  ProductVariation,
  StripePayment,
  StripePaymentIntentEnum,
  VariationImage,
} from '@prisma/client';
import { JwtPayloadDto } from 'src/modules/auth/dto/jwtPayload.dto';

import { ROLES } from '../constants';
import { DiscountType } from '../data/enums/discount-type.enum';
import { Gender } from '../data/enums/gender.enum';
import {
  CartItemWithFullDetails,
  CartItemWithProductVariation,
  ProductVariationWithImagesAndProduct,
} from '../prisma-types';

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

export const cartItems: CartItemWithProductVariation[] = [
  {
    userId: '2e30d6d3-2986-4d3d-827d-5771ad836fba',
    productVariationId: '67062ffa-b66b-4b3e-ba09-342e0b9ebb80',
    quantity: 2,
    productVariation: {
      id: '67062ffa-b66b-4b3e-ba09-342e0b9ebb80',
      productId: '6d8930e3-ca1f-446a-97b1-5dacbd0bfbb3',
      price: new Prisma.Decimal(73.65),
      discount: new Prisma.Decimal(10),
      discountType: 'PERCENTAGE',
      size: 'S',
      color: 'mint green',
      stock: 32,
      stockRefilledAt: new Date(),
      isEnabled: true,
      isDeleted: false,
    },
  },
  {
    userId: '2e30d6d3-2986-4d3d-827d-5771ad836fba',
    productVariationId: 'aefff0c5-04f7-49eb-ab6d-1ab34d1bef53',
    quantity: 3,
    productVariation: {
      id: 'aefff0c5-04f7-49eb-ab6d-1ab34d1bef53',
      productId: 'e4c810a8-cb5a-4d60-9c0f-acf238a4ad1b',
      price: new Prisma.Decimal(46.59),
      discount: new Prisma.Decimal(5),
      discountType: 'PERCENTAGE',
      size: 'XL',
      color: 'Blue',
      stock: 29,
      stockRefilledAt: new Date(),
      isEnabled: true,
      isDeleted: false,
    },
  },
];
export const validVariationImages: VariationImage[] = [
  {
    id: '5e0cb744-dac3-4b3e-96b1-3f50d83eb361',
    productVariationId: '67062ffa-b66b-4b3e-ba09-342e0b9ebb80',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
  },
  {
    id: '98cdd450-cb25-4fab-b948-0875fd086ff7',
    productVariationId: '67062ffa-b66b-4b3e-ba09-342e0b9ebb80',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
  },
  {
    id: '783f53d1-bb7e-4d40-851b-217cdbc0a648',
    productVariationId: '67062ffa-b66b-4b3e-ba09-342e0b9ebb80',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
  },
];

export const productVariationWithDetails1: ProductVariationWithImagesAndProduct = {
  id: '67062ffa-b66b-4b3e-ba09-342e0b9ebb80',
  productId: '6d8930e3-ca1f-446a-97b1-5dacbd0bfbb3',
  price: new Prisma.Decimal(73.65),
  discount: new Prisma.Decimal(10),
  discountType: DiscountType.PERCENTAGE,
  size: 'S',
  color: 'mint green',
  stock: 32,
  stockRefilledAt: new Date(),
  isEnabled: true,
  isDeleted: false,
  product: {
    id: '6d8930e3-ca1f-446a-97b1-5dacbd0bfbb3',
    name: 'Generic Granite Bike',
    gender: 'FEMALE',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
    categoryId: 'aad62167-235d-4d1d-b4fd-f687b020acd0',
    description: 'Professional-grade Sausages perfect for thorny training and recreational use',
    isEnabled: true,
    isDeleted: false,
    likesCount: 0,
    minPrice: new Prisma.Decimal(73.65),
    maxPrice: new Prisma.Decimal(79.29),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  variationImages: validVariationImages,
};

export const productVariationWithDetails2: ProductVariationWithImagesAndProduct = {
  id: 'aefff0c5-04f7-49eb-ab6d-1ab34d1bef53',
  productId: 'e4c810a8-cb5a-4d60-9c0f-acf238a4ad1b',
  price: new Prisma.Decimal(46.59),
  discount: new Prisma.Decimal(5),
  discountType: DiscountType.PERCENTAGE,
  size: 'XL',
  color: 'Blue',
  stock: 29,
  stockRefilledAt: new Date(),
  isEnabled: true,
  isDeleted: false,
  product: {
    id: 'e4c810a8-cb5a-4d60-9c0f-acf238a4ad1b',
    name: 'Small Granite Hat',
    gender: 'MALE',
    thumbnailUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
    categoryId: 'aad62167-235d-4d1d-b4fd-f687b020acd0',
    description: "Huels Group's most advanced Bacon technology increases lanky capabilities",
    isEnabled: true,
    isDeleted: false,
    likesCount: 0,
    minPrice: new Prisma.Decimal(20.8),
    maxPrice: new Prisma.Decimal(51.05),
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  variationImages: [
    {
      id: 'c58b9faa-686c-4fc9-bd77-a19094d25513',
      productVariationId: 'aefff0c5-04f7-49eb-ab6d-1ab34d1bef53',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
    },
    {
      id: '039d00d2-a3af-43d1-bb6a-409797188c00',
      productVariationId: 'aefff0c5-04f7-49eb-ab6d-1ab34d1bef53',
      imageUrl: 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png',
    },
  ],
};

export const validCartItemsWithProductVariationProductAndImages: CartItemWithFullDetails[] = [
  {
    userId: '2e30d6d3-2986-4d3d-827d-5771ad836fba',
    productVariationId: '67062ffa-b66b-4b3e-ba09-342e0b9ebb80',
    quantity: 2,
    productVariation: productVariationWithDetails1,
  },
  {
    userId: '2e30d6d3-2986-4d3d-827d-5771ad836fba',
    productVariationId: 'aefff0c5-04f7-49eb-ab6d-1ab34d1bef53',
    quantity: 3,
    productVariation: productVariationWithDetails2,
  },
];

export const validUserWithEmail = {
  id: validUUID1,
  email: 'riskai.xd@ragnarok.com',
  password: 'hashedPassword',
  firstName: 'Ronald',
  lastName: 'Ris',
  createdAt: new Date(),
};

export const fakeDecodedUser: JwtPayloadDto = {
  userId: validUUID1,
  email: 'test@example.com',
  iat: 123,
  exp: 456,
  firstName: 'Kai',
  lastName: 'Ris',
  roles: [ROLES.CLIENT],
};

export const mockStripePayment: StripePayment = {
  id: validUUID5,
  orderId: validUUID6,
  amount: new Prisma.Decimal(300),
  currency: 'usd',
  webhookPaymentIntent: StripePaymentIntentEnum.requires_payment_method,
  stripePaymentId: 'stripe-pi-2',
  clientSecret: 'client_secret_2',
  webhookData: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};
