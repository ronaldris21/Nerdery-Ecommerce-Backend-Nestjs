import { Test, TestingModule } from '@nestjs/testing';

import { DataloadersService } from './dataloaders.service';

describe('DataloadersService', () => {
  let service: DataloadersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataloadersService],
    }).compile();

    service = module.get<DataloadersService>(DataloadersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
