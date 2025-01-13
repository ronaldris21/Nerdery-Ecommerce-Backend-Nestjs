/*
  Warnings:

  - The values [canceled,processing,requires_action,requires_capture,requires_confirmation,requires_payment_method,succeeded,payment_failed] on the enum `StripePaymentIntentEnum` will be removed. If these variants are still used in the database, this will fail.
  - The `webhookPaymentIntent` column on the `StripePayment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StripePaymentIntentEnum_new" AS ENUM ('CANCELED', 'PROCESSING', 'REQUIRES_ACTION', 'REQUIRES_CAPTURE', 'REQUIRES_CONFIRMATION', 'REQUIRES_PAYMENT_METHOD', 'SUCCEEDED', 'PAYMENT_FAILED');
ALTER TABLE "StripePayment" ALTER COLUMN "webhookPaymentIntent" TYPE "StripePaymentIntentEnum_new" USING ("webhookPaymentIntent"::text::"StripePaymentIntentEnum_new");
ALTER TYPE "StripePaymentIntentEnum" RENAME TO "StripePaymentIntentEnum_old";
ALTER TYPE "StripePaymentIntentEnum_new" RENAME TO "StripePaymentIntentEnum";
DROP TYPE "StripePaymentIntentEnum_old";
COMMIT;

-- AlterTable
ALTER TABLE "StripePayment" DROP COLUMN "webhookPaymentIntent",
ADD COLUMN     "webhookPaymentIntent" "StripePaymentIntentEnum" NOT NULL DEFAULT 'REQUIRES_PAYMENT_METHOD';

-- DropEnum
DROP TYPE "StripePaymentIntentEnum2";
