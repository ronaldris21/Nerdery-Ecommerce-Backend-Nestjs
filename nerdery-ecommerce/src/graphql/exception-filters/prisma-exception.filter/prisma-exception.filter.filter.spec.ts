import { PrismaClientExceptionFilter } from './prisma-exception.filter.filter';

describe('PrismaClientExceptionFilter', () => {
  it('should be defined', () => {
    expect(new PrismaClientExceptionFilter()).toBeDefined();
  });
});
