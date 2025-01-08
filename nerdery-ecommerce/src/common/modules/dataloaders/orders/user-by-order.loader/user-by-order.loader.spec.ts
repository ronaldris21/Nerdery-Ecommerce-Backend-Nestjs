import { Test, TestingModule } from '@nestjs/testing';

import { UserByOrderLoader } from './user-by-order.loader';

describe('UserByOrderLoader', () => {
  let provider: UserByOrderLoader;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserByOrderLoader],
    }).compile();

    provider = module.get<UserByOrderLoader>(UserByOrderLoader);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
