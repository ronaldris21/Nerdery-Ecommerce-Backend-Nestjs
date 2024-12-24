import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  /**
   *
   */
  constructor() {
    super({
      log: ['query', 'info', 'warn', 'error'], // Logs all Prisma query activity
      errorFormat: 'pretty', // Makes Prisma error output pretty
    });
  }

  async onModuleInit() {
    await this.$connect();
  }
  async onModuleDestroy() {
    await this.$disconnect();
  }
}
