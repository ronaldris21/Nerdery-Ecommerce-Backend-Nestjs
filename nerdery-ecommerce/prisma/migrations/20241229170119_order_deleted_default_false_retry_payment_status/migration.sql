-- AlterEnum
ALTER TYPE "OrderStatusEnum" ADD VALUE 'RETRY_PAYMENT';

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "isDeleted" SET DEFAULT false;
