import { Controller, Get } from '@nestjs/common';

import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('/hello')
  getHello(): string {
    return 'Hello World!';
  }

  @Get('/db')
  async dbUsersCount(): Promise<number> {
    return await this.prisma.user.count();
  }
}
