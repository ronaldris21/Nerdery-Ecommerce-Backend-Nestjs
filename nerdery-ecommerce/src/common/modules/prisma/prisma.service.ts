import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private readonly retryDelay = 3000;
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      // log: ['query', 'info', 'warn', 'error'], // Logs all Prisma query activity
      errorFormat: 'pretty', // Makes Prisma error output pretty
    });
  }

  async onModuleInit() {
    await this.connectWithRetry();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async connectWithRetry(retries = 0): Promise<void> {
    try {
      await this.$connect();

      this.logger.log('Connected to the database successfully!');
      // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (error) {
      this.logger.error(`Database connection failed. Retrying (${retries + 1})...`);

      await new Promise((resolve) => setTimeout(resolve, this.retryDelay));

      return this.connectWithRetry(retries + 1);
    }
  }
}
