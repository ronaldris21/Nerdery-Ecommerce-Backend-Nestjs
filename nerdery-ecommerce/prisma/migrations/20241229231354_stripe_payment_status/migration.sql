/*
  Warnings:

  - The values [REQUIRES_PAYMENT_METHOD,REQUIRES_CONFIRMATION,REQUIRES_ACTION,PROCESSING,SUCCEEDED,REQUIRES_CAPTURE,CANCELED,FAILED] on the enum `StripePaymentIntentEnum` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "StripePaymentIntentEnum_new" AS ENUM ('canceled', 'processing', 'requires_action', 'requires_capture', 'requires_confirmation', 'requires_payment_method', 'succeeded');
ALTER TABLE "StripePayment" ALTER COLUMN "webhookPaymentIntent" TYPE "StripePaymentIntentEnum_new" USING ("webhookPaymentIntent"::text::"StripePaymentIntentEnum_new");
ALTER TYPE "StripePaymentIntentEnum" RENAME TO "StripePaymentIntentEnum_old";
ALTER TYPE "StripePaymentIntentEnum_new" RENAME TO "StripePaymentIntentEnum";
DROP TYPE "StripePaymentIntentEnum_old";
COMMIT;
