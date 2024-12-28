-- AlterTable
ALTER TABLE "Product" ALTER COLUMN "thumbnailUrl" SET DEFAULT 'https://picsum.photos/seed/0BPoSdVVje/200/300';

-- AlterTable
ALTER TABLE "ProductLike" ALTER COLUMN "likedAt" DROP DEFAULT;
