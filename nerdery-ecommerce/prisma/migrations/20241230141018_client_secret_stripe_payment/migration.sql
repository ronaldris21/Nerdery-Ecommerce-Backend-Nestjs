-- AlterEnum
ALTER TYPE "StripePaymentIntentEnum" ADD VALUE 'payment_failed';

-- AlterTable
ALTER TABLE "StripePayment" ADD COLUMN     "clientSecret" VARCHAR(255) NOT NULL DEFAULT '';
