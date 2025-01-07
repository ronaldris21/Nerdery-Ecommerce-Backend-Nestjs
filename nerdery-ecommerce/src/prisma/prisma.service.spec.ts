import { Test, TestingModule } from '@nestjs/testing';

import { PrismaService } from './prisma.service';

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    jest.clearAllMocks();
    jest.clearAllMocks();
    jest.useRealTimers();

    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.useRealTimers();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('onModuleInit', async () => {
    jest.spyOn(service, 'onModuleInit').mockResolvedValueOnce();

    await service.onModuleInit();

    expect(service.onModuleInit).toHaveBeenCalledTimes(1);
  });

  it('onModuleDestroy', async () => {
    jest.spyOn(service, 'onModuleDestroy').mockResolvedValueOnce();

    await service.onModuleDestroy();

    expect(service.onModuleDestroy).toHaveBeenCalledTimes(1);
  });

  it(
    'Database connection in the first try',
    async () => {
      jest
        .spyOn(service, '$connect')
        .mockRejectedValueOnce(new Error('Database connection failed. Retrying (1)...'))
        .mockRejectedValueOnce(new Error('Database connection failed. Retrying (2)...'))
        .mockResolvedValueOnce();

      await service.connectWithRetry();

      expect(service.$connect).toHaveBeenCalledTimes(3);
    },
    4 * 3 * 1000, // extra timeout in milliseconds
  );
});
