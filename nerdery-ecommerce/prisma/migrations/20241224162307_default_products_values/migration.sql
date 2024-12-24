-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "thumbnailUrl" SET DEFAULT 'https://via.placeholder.com/150',
ALTER COLUMN "isEnabled" SET DEFAULT false,
ALTER COLUMN "isDeleted" SET DEFAULT false,
ALTER COLUMN "likesCount" SET DEFAULT 0,
ALTER COLUMN "minPrice" SET DEFAULT 0.0,
ALTER COLUMN "maxPrice" SET DEFAULT 0.0;
