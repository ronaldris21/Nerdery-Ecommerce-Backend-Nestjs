/*
  Warnings:

  - Changed the type of `webhookPaymentIntent` on the `StripePayment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "StripePaymentIntentEnum2" AS ENUM ('CANCELED', 'PROCESSING', 'REQUIRES_ACTION', 'REQUIRES_CAPTURE', 'REQUIRES_CONFIRMATION', 'REQUIRES_PAYMENT_METHOD', 'SUCCEEDED', 'PAYMENT_FAILED');

-- AlterTable
ALTER TABLE "StripePayment" DROP COLUMN "webhookPaymentIntent",
ADD COLUMN     "webhookPaymentIntent" TEXT NOT NULL;

-- Update existing values to upper case
UPDATE "StripePayment" SET "webhookPaymentIntent" = UPPER("webhookPaymentIntent");
