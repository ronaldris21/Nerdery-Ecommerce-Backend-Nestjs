import {
  PrismaClient,
  Prisma,
  GenderEnum,
  DiscountTypeEnum,
} from '@prisma/client';

const prisma = new PrismaClient();

const clientRoleName = 'Client';
const managerRoleName = 'Manage';

const rolesData: Prisma.RoleCreateInput[] = [
  {
    name: clientRoleName,
  },
  {
    name: managerRoleName,
  },
];

const usersWithRolesData = (managerRoleId: string, clientRoleId: string) => {
  const usersData: Prisma.UserCreateInput[] = [
    {
      firstName: 'Ronald',
      lastName: 'Rios',
      email: 'ronaldrios@ravn.co',
      passwordHash: 'xd',
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
      firstName: 'Ashley',
      lastName: 'Kai',
      email: 'ashley@ravn.co',
      passwordHash: 'xdxd',
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
    thumbnailUrl: 'https://picsum.photos/200/300',
    description: 'High-performance running shoes for all terrains.',
    isEnable: true,
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
          isEnable: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: 'https://picsum.photos/200/300' },
              { imageUrl: 'https://picsum.photos/200/300' },
            ],
          },
        },
        {
          price: 69.99,
          discount: 5.0,
          discountType: DiscountTypeEnum.PERCENTAGE,
          size: 'L',
          color: 'Blue',
          stock: 50,
          isEnable: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: 'https://picsum.photos/200/300' },
              { imageUrl: 'https://picsum.photos/200/300' },
            ],
          },
        },
        {
          price: 79.99,
          discount: 0.0,
          discountType: DiscountTypeEnum.NONE,
          size: 'XL',
          color: 'Red',
          stock: 30,
          isEnable: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: 'https://picsum.photos/200/300' },
              { imageUrl: 'https://picsum.photos/200/300' },
            ],
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
    thumbnailUrl: 'https://picsum.photos/200/300',
    description: 'Stylish and comfortable sports jacket.',
    isEnable: true,
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
          isEnable: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: 'https://picsum.photos/200/300' },
              { imageUrl: 'https://picsum.photos/200/300' },
            ],
          },
        },
        {
          price: 99.99,
          discount: 10.0,
          discountType: DiscountTypeEnum.PERCENTAGE,
          size: 'M',
          color: 'Black',
          stock: 40,
          isEnable: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: 'https://picsum.photos/200/300' },
              { imageUrl: 'https://picsum.photos/200/300' },
            ],
          },
        },
        {
          price: 119.99,
          discount: 19.99,
          discountType: DiscountTypeEnum.FIXED,
          size: 'L',
          color: 'Blue',
          stock: 15,
          isEnable: true,
          isDeleted: false,
          variationImages: {
            create: [
              { imageUrl: 'https://picsum.photos/200/300' },
              { imageUrl: 'https://picsum.photos/200/300' },
            ],
          },
        },
      ],
    },
  },
];

async function main() {
  console.log(`Start seeding ...`);
  console.log(`deleting all data ...`);
  // await prisma.variationImage.deleteMany();
  // await prisma.productVariation.deleteMany();
  // await prisma.product.deleteMany();
  // await prisma.category.deleteMany();
  // await prisma.refreshToken.deleteMany();
  // await prisma.passwordReset.deleteMany();
  // await prisma.userRole.deleteMany();
  // await prisma.rolePermission.deleteMany();
  // await prisma.cartItem.deleteMany();
  // await prisma.orderIncident.deleteMany();
  // await prisma.stripePayment.deleteMany();
  // await prisma.orderItem.deleteMany();
  // await prisma.order.deleteMany();
  // await prisma.user.deleteMany();
  // await prisma.permission.deleteMany();

  console.log(`Start seeding ...`);

  console.log(`Creating roles ...`);
  await prisma.role.createMany({ data: rolesData, skipDuplicates: true });

  console.log(`Creating users ...`);
  const clientRoleId = (
    await prisma.role.findFirst({ where: { name: managerRoleName } })
  ).id;
  const managerRoleId = (
    await prisma.role.findFirst({ where: { name: managerRoleName } })
  ).id;

  const users = usersWithRolesData(managerRoleId, clientRoleId);
  for (const user of users) {
    try {
      await prisma.user.create({ data: user });
    } catch (error) {
      console.error(error);
    }
  }

  console.log(`Creating users ...`);

  for (const prod of productData) {
    try {
      await prisma.product.create({ data: prod });
    } catch (error) {
      console.error(error);
    }
  }

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
