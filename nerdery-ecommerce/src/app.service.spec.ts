import { Test, TestingModule } from '@nestjs/testing';

import { AppService } from './app.service';

describe('AppService', () => {
  let service: AppService;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      providers: [AppService],
    }).compile();

    service = app.get(AppService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('getHello', () => {
    expect(service.getHello()).toBe('Hello World!');
  });
});
