/* eslint-disable no-console */
import { PrismaClient, Prisma, GenderEnum, DiscountTypeEnum } from '@prisma/client';
import * as bcrypt from 'bcrypt';

import { generateFakeProduct } from './faker-products';

const clientRoleName = 'Client';
const managerRoleName = 'Manager';

const prisma = new PrismaClient();

const createImageURL = () => {
  return 'https://upload.wikimedia.org/wikipedia/en/c/cb/Monkey_D_Luffy.png';
};

const rolesData: Prisma.RoleCreateInput[] = [
  {
    name: clientRoleName,
  },
  {
    name: managerRoleName,
  },
];

const usersWithRolesData = async (managerRoleId: string, clientRoleId: string) => {
  const roundsOfHash = parseInt(process.env.SECURITY_BCRYPT_SALT_OR_ROUND, 10) || 10;

  const usersData: Prisma.UserCreateInput[] = [
    {
      firstName: 'Ronald',
      lastName: 'Rios',
      email: 'ronaldrios@ravn.co',
      password: await bcrypt.hash('25252525', roundsOfHash),
      createdAt: new Date(),
      userRoles: {
        create: {
          role: {
            connect: {
              id: managerRoleId,
            },
          },
        },
      },
    },
    {
      firstName: 'Xavier',
      lastName: 'Kai',
      email: 'retejada@alu.ucam.edu',
      password: await bcrypt.hash('12345678', roundsOfHash),
      createdAt: new Date(),
      userRoles: {
        create: {
          role: {
            connect: {
              id: clientRoleId,
            },
          },
        },
      },
    },
  ];

  return usersData;
};

const productData: Prisma.ProductCreateInput[] = [
  {
    name: 'Running Shoes',
    gender: GenderEnum.UNISEX,
    thumbnailUrl: createImageURL(),
    description: 'High-performance running shoes for all terrains.',
    isEnabled: true,
    isDeleted: false,
    likesCount: 0,
    minPrice: 59.99,
    maxPrice: 79.99,

    category: {
      connectOrCreate: {
        create: {
          name: 'Shoes',
        },
        where: {
          name: 'Shoes',
        },
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    productVariations: {
      create: [
        {
          price: 59.99,
          discount: 10.0,
          discountType: DiscountTypeEnum.FIXED,
          size: 'M',
          color: 'Black',
          stock: 100,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [{ imageUrl: createImageURL() }, { imageUrl: createImageURL() }],
          },
        },
        {
          price: 69.99,
          discount: 5.0,
          discountType: DiscountTypeEnum.PERCENTAGE,
          size: 'L',
          color: 'Blue',
          stock: 50,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [{ imageUrl: createImageURL() }, { imageUrl: createImageURL() }],
          },
        },
        {
          price: 79.99,
          discount: 0.0,
          discountType: DiscountTypeEnum.NONE,
          size: 'XL',
          color: 'Red',
          stock: 30,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [{ imageUrl: createImageURL() }, { imageUrl: createImageURL() }],
          },
        },
      ],
    },
  },
  {
    name: 'Sports Jacket',
    category: {
      connectOrCreate: {
        create: {
          name: 'Jackets',
        },
        where: {
          name: 'Jackets',
        },
      },
    },
    gender: GenderEnum.MALE,
    thumbnailUrl: createImageURL(),
    description: 'Stylish and comfortable sports jacket.',
    isEnabled: true,
    isDeleted: false,
    likesCount: 0,
    minPrice: 89.99,
    maxPrice: 119.99,
    createdAt: new Date(),
    updatedAt: new Date(),
    productVariations: {
      create: [
        {
          price: 89.99,
          discount: 15.0,
          discountType: DiscountTypeEnum.PERCENTAGE,
          size: 'S',
          color: 'Green',
          stock: 20,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [{ imageUrl: createImageURL() }, { imageUrl: createImageURL() }],
          },
        },
        {
          price: 99.99,
          discount: 10.0,
          discountType: DiscountTypeEnum.PERCENTAGE,
          size: 'M',
          color: 'Black',
          stock: 40,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [{ imageUrl: createImageURL() }, { imageUrl: createImageURL() }],
          },
        },
        {
          price: 119.99,
          discount: 19.99,
          discountType: DiscountTypeEnum.FIXED,
          size: 'L',
          color: 'Blue',
          stock: 15,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [{ imageUrl: createImageURL() }, { imageUrl: createImageURL() }],
          },
        },
      ],
    },
  },
];

const productDataMen: Prisma.ProductCreateInput[] = [
  {
    name: 'Track Pants',
    gender: GenderEnum.MALE,
    thumbnailUrl: createImageURL(),
    description: 'Comfortable and durable track pants for men.',
    isEnabled: true,
    isDeleted: false,
    likesCount: 0,
    minPrice: 49.99,
    maxPrice: 69.99,
    category: {
      connectOrCreate: {
        create: { name: 'Pants' },
        where: { name: 'Pants' },
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    productVariations: {
      create: [
        {
          price: 49.99,
          discount: 5.0,
          discountType: DiscountTypeEnum.PERCENTAGE,
          size: 'M',
          color: 'Black',
          stock: 100,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: createImageURL() },
              {
                imageUrl: createImageURL(),
              },
            ],
          },
        },
        {
          price: 59.99,
          discount: 10.0,
          discountType: DiscountTypeEnum.FIXED,
          size: 'L',
          color: 'Navy Blue',
          stock: 50,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: createImageURL() },
              {
                imageUrl: createImageURL(),
              },
            ],
          },
        },
        {
          price: 69.99,
          discount: 0.0,
          discountType: DiscountTypeEnum.NONE,
          size: 'XL',
          color: 'Grey',
          stock: 30,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: createImageURL() },
              {
                imageUrl: createImageURL(),
              },
            ],
          },
        },
      ],
    },
  },
  {
    name: 'Sweatpants',
    gender: GenderEnum.MALE,
    thumbnailUrl: createImageURL(),
    description: 'Soft and cozy sweatpants for everyday wear.',
    isEnabled: true,
    isDeleted: false,
    likesCount: 0,
    minPrice: 39.99,
    maxPrice: 59.99,
    category: {
      connectOrCreate: {
        create: { name: 'Pants' },
        where: { name: 'Pants' },
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    productVariations: {
      create: [
        {
          price: 39.99,
          discount: 0.0,
          discountType: DiscountTypeEnum.NONE,
          size: 'S',
          color: 'Black',
          stock: 50,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: createImageURL() },
              {
                imageUrl: createImageURL(),
              },
            ],
          },
        },
        {
          price: 49.99,
          discount: 10.0,
          discountType: DiscountTypeEnum.FIXED,
          size: 'M',
          color: 'Grey',
          stock: 70,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [{ imageUrl: createImageURL() }, { imageUrl: createImageURL() }],
          },
        },
        {
          price: 59.99,
          discount: 5.0,
          discountType: DiscountTypeEnum.PERCENTAGE,
          size: 'L',
          color: 'Navy Blue',
          stock: 40,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [{ imageUrl: createImageURL() }, { imageUrl: createImageURL() }],
          },
        },
      ],
    },
  },
];

const productDataWomen: Prisma.ProductCreateInput[] = [
  {
    name: 'Hoodie',
    gender: GenderEnum.FEMALE,
    thumbnailUrl: createImageURL(),
    description: 'Stylish and warm hoodie for women.',
    isEnabled: true,
    isDeleted: false,
    likesCount: 0,
    minPrice: 59.99,
    maxPrice: 79.99,
    category: {
      connectOrCreate: {
        create: { name: 'Hoodies' },
        where: { name: 'Hoodies' },
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    productVariations: {
      create: [
        {
          price: 59.99,
          discount: 10.0,
          discountType: DiscountTypeEnum.PERCENTAGE,
          size: 'S',
          color: 'Pink',
          stock: 80,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [{ imageUrl: createImageURL() }, { imageUrl: createImageURL() }],
          },
        },
        {
          price: 69.99,
          discount: 5.0,
          discountType: DiscountTypeEnum.PERCENTAGE,
          size: 'M',
          color: 'Grey',
          stock: 60,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [{ imageUrl: createImageURL() }, { imageUrl: createImageURL() }],
          },
        },
        {
          price: 79.99,
          discount: 0.0,
          discountType: DiscountTypeEnum.NONE,
          size: 'L',
          color: 'Black',
          stock: 40,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [{ imageUrl: createImageURL() }, { imageUrl: createImageURL() }],
          },
        },
      ],
    },
  },
  {
    name: 'Sweatshirt',
    gender: GenderEnum.FEMALE,
    thumbnailUrl: createImageURL(),
    description: 'Cozy sweatshirt with a trendy design.',
    isEnabled: true,
    isDeleted: false,
    likesCount: 0,
    minPrice: 49.99,
    maxPrice: 69.99,
    category: {
      connectOrCreate: {
        create: { name: 'Hoodies & Sweatshirts' },
        where: { name: 'Hoodies & Sweatshirts' },
      },
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    productVariations: {
      create: [
        {
          price: 49.99,
          discount: 0.0,
          discountType: DiscountTypeEnum.NONE,
          size: 'S',
          color: 'White',
          stock: 70,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: createImageURL() },
              {
                imageUrl: createImageURL(),
              },
            ],
          },
        },
        {
          price: 59.99,
          discount: 10.0,
          discountType: DiscountTypeEnum.FIXED,
          size: 'M',
          color: 'Blue',
          stock: 50,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: createImageURL() },
              {
                imageUrl: createImageURL(),
              },
            ],
          },
        },
        {
          price: 69.99,
          discount: 0.0,
          discountType: DiscountTypeEnum.NONE,
          size: 'L',
          color: 'Black',
          stock: 30,
          isEnabled: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: createImageURL() },
              {
                imageUrl: createImageURL(),
              },
            ],
          },
        },
      ],
    },
  },
];

let count = 0;
async function insertProducts(products: Prisma.ProductCreateInput[]) {
  for (const prod of products) {
    try {
      if (
        await prisma.product.findFirst({
          where: {
            name: prod.name,
            gender: prod.gender,
            description: prod.description,
          },
        })
      ) {
        continue;
      }
      await prisma.product.create({ data: prod });
      console.log(`${++count}\tProduct ${prod.name} created.`);
    } catch (error) {
      console.error(error);
    }
  }
}

async function main() {
  console.log(`Start seeding ...`);
  console.log(`deleting all data ...`);
  await prisma.cartItem.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.orderIncident.deleteMany();
  await prisma.stripePayment.deleteMany();
  await prisma.order.deleteMany();

  await prisma.productLike.deleteMany();
  await prisma.variationImage.deleteMany();
  await prisma.productVariation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();

  await prisma.refreshToken.deleteMany();
  await prisma.passwordReset.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.orderIncident.deleteMany();

  await prisma.userRole.deleteMany();
  await prisma.rolePermission.deleteMany();
  await prisma.permission.deleteMany();
  await prisma.role.deleteMany();
  await prisma.user.deleteMany();

  console.log(`Start seeding ...`);

  console.log(`Creating roles ...`);
  await prisma.role.createMany({ data: rolesData, skipDuplicates: true });

  console.log(`Creating users ...`);
  const clientRoleId = (await prisma.role.findFirst({ where: { name: managerRoleName } })).id;
  const managerRoleId = (await prisma.role.findFirst({ where: { name: managerRoleName } })).id;

  const users = await usersWithRolesData(managerRoleId, clientRoleId);
  for (const user of users) {
    try {
      if (await prisma.user.findFirst({ where: { email: user.email } })) {
        continue;
      }
      await prisma.user.create({ data: user });
    } catch (error) {
      console.error(error);
    }
  }

  console.log(`Creating products (manual) ...`);
  await Promise.all([
    insertProducts(productData),
    insertProducts(productDataMen),
    insertProducts(productDataWomen),
  ]);

  for (let i = 0; i < 25; i++) {
    console.log(`Creating fake product round: ${i} ...`);
    await setTimeout(() => {}, 1000);
    await insertProducts(generateFakeProduct());
  }

  console.log(`Calculating real max-min.`);
  const products = await prisma.product.findMany({
    include: { productVariations: true },
  });

  const updatePromises = products.map(async (product) => {
    const prices = product.productVariations.map((p) => Number(p.price));

    const minPrice = prices.length > 0 ? Math.min(...prices) : product.minPrice;
    const maxPrice = prices.length > 0 ? Math.max(...prices) : product.maxPrice;

    const newData = {};
    if (minPrice) newData['minPrice'] = minPrice;
    if (maxPrice) newData['maxPrice'] = maxPrice;

    await prisma.product.update({
      where: { id: product.id },
      data: newData,
    });
  });

  await Promise.all(updatePromises);

  console.log(`Like all products from retejada@alu.ucam.edu user`);
  const retejada = await prisma.user.findFirst({ where: { email: 'retejada@alu.ucam.edu' } });
  await prisma.productLike.createMany({
    data: products.map((p) => ({
      userId: retejada.id,
      productId: p.id,
    })),
  });

  console.log(`Seeding finished.`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
