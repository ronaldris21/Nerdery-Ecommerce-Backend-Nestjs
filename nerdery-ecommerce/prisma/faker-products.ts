import { faker } from '@faker-js/faker';
import { GenderEnum, Prisma } from '@prisma/client';

function generateFakeImage() {
  //   return faker.image.url({ width: 200, height: 300 });
  return 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png';
}

export function generateFakeProduct() {
  const productData: Prisma.ProductCreateInput[] = [
    {
      name: faker.commerce.productName(),
      gender: GenderEnum.MALE,
      thumbnailUrl: generateFakeImage(),
      description: faker.commerce.productDescription(),
      isEnabled: true,
      isDeleted: false,
      likesCount: 0,
      minPrice: parseFloat(faker.commerce.price({ min: 50, max: 60 })),
      maxPrice: parseFloat(faker.commerce.price({ min: 71, max: 85 })),
      category: {
        connectOrCreate: {
          create: { name: 'Fake' },
          where: { name: 'Fake' },
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      productVariations: {
        create: [
          {
            price: parseFloat(faker.commerce.price({ min: 20, max: 60 })),
            discount: 10.0,
            discountType: 'FIXED',
            size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
            color: faker.color.human(),
            stock: faker.number.int({ min: 20, max: 30 }),
            isEnabled: true,
            isDeleted: false,
            variationImages: {
              create: [{ imageUrl: generateFakeImage() }, { imageUrl: generateFakeImage() }],
            },
          },
          {
            price: parseFloat(faker.commerce.price({ min: 20, max: 60 })),
            discount: 5.0,
            discountType: 'PERCENTAGE',
            size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
            color: 'Blue',
            stock: faker.number.int(50),
            isEnabled: true,
            isDeleted: false,
            variationImages: {
              create: [{ imageUrl: generateFakeImage() }, { imageUrl: generateFakeImage() }],
            },
          },
          {
            price: parseFloat(faker.commerce.price({ min: 20, max: 60 })),
            discount: 0.0,
            discountType: 'NONE',
            size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
            color: faker.color.human(),
            stock: faker.number.int(30),
            isEnabled: true,
            isDeleted: false,
            variationImages: {
              create: [
                { imageUrl: generateFakeImage() },
                { imageUrl: generateFakeImage() },
                { imageUrl: generateFakeImage() },
              ],
            },
          },
        ],
      },
    },
    {
      name: faker.commerce.productName(),
      gender: GenderEnum.FEMALE,
      thumbnailUrl: generateFakeImage(),
      description: faker.commerce.productDescription(),
      isEnabled: true,
      isDeleted: false,
      likesCount: 0,
      minPrice: parseFloat(faker.commerce.price({ min: 50, max: 60 })),
      maxPrice: parseFloat(faker.commerce.price({ min: 70, max: 80 })),
      category: {
        connectOrCreate: {
          create: { name: 'Fake' },
          where: { name: 'Fake' },
        },
      },
      createdAt: new Date(),
      updatedAt: new Date(),
      productVariations: {
        create: [
          {
            price: parseFloat(faker.commerce.price({ min: 70, max: 80 })),
            discount: 15.0,
            discountType: 'PERCENTAGE',
            size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
            color: faker.color.human(),
            stock: faker.number.int(20),
            isEnabled: true,
            isDeleted: false,
            variationImages: {
              create: [
                { imageUrl: generateFakeImage() },
                { imageUrl: generateFakeImage() },
                { imageUrl: generateFakeImage() },
              ],
            },
          },
          {
            price: parseFloat(faker.commerce.price({ min: 70, max: 80 })),
            discount: 10.0,
            discountType: 'PERCENTAGE',
            size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
            color: faker.color.human(),
            stock: faker.number.int(40),
            isEnabled: true,
            isDeleted: false,
            variationImages: {
              create: [
                { imageUrl: generateFakeImage() },
                { imageUrl: generateFakeImage() },
                { imageUrl: generateFakeImage() },
              ],
            },
          },
          {
            price: parseFloat(faker.commerce.price({ min: 70, max: 80 })),
            discount: 19.99,
            discountType: 'FIXED',
            size: faker.helpers.arrayElement(['S', 'M', 'L', 'XL']),
            color: faker.color.human(),
            stock: faker.number.int(15),
            isEnabled: true,
            isDeleted: false,
            variationImages: {
              create: [{ imageUrl: generateFakeImage() }, { imageUrl: generateFakeImage() }],
            },
          },
        ],
      },
    },
  ];

  return productData;
}
