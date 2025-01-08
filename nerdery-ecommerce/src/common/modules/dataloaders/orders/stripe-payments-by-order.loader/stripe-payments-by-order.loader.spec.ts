import { Test, TestingModule } from '@nestjs/testing';

import { StripePaymentsByOrderLoader } from './stripe-payments-by-order.loader';

describe('StripePaymentsByOrderLoader', () => {
  let provider: StripePaymentsByOrderLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StripePaymentsByOrderLoader],
    }).compile();

    provider = module.get<StripePaymentsByOrderLoader>(StripePaymentsByOrderLoader);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
