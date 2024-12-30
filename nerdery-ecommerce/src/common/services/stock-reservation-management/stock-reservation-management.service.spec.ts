import { Test, TestingModule } from '@nestjs/testing';

import { StockReservationManagementService } from './stock-reservation-management.service';

describe('StockReservationManagementService', () => {
  let service: StockReservationManagementService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [StockReservationManagementService],
    }).compile();

    service = module.get<StockReservationManagementService>(StockReservationManagementService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
