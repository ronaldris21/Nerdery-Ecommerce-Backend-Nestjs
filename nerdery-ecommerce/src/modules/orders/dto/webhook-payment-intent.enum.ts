import { registerEnumType } from '@nestjs/graphql';
import { StripePaymentIntentEnum } from '@prisma/client';

export {
  StripePaymentIntentEnum as StripePaymentIntent,
  StripePaymentIntentEnum as webhookPaymentIntent,
};

registerEnumType(StripePaymentIntentEnum, { name: 'StripePaymentIntent' });
