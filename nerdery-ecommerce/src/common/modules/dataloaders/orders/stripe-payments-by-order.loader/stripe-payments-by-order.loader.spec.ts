import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { Test, TestingModule } from '@nestjs/testing';

import { DataloadersService } from '../../dataloaders.service';

import { StripePaymentsByOrderLoader } from './stripe-payments-by-order.loader';

describe('StripePaymentsByOrderLoader', () => {
  let loader: StripePaymentsByOrderLoader;
  let dataloadersService: DeepMocked<DataloadersService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripePaymentsByOrderLoader,
        { provide: DataloadersService, useValue: createMock<DataloadersService>() },
      ],
    }).compile();

    loader = await module.resolve<StripePaymentsByOrderLoader>(StripePaymentsByOrderLoader);
    dataloadersService = module.get(DataloadersService);
  });

  it('should be defined', () => {
    expect(loader).toBeDefined();
    expect(dataloadersService).toBeDefined();
  });
});
