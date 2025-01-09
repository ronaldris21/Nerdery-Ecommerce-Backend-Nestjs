import { Injectable, Scope } from '@nestjs/common';
import { User } from '@prisma/client';
import DataLoader from 'dataloader';

import { DataloadersService } from '../../dataloaders.service';
// 1 to 1 loader
type UserByOrder = User & { orders: { id: string }[] };
@Injectable({ scope: Scope.REQUEST })
export class UserByOrderLoader extends DataLoader<string, User> {
  constructor(private readonly dataloadersService: DataloadersService) {
    super((keys: string[]) => this.batchLoadFunction(keys));
  }

  async batchLoadFunction(orderIds: string[]) {
    const users = await this.dataloadersService.listUserByOrder(orderIds);

    return this.mapResults(orderIds, users as UserByOrder[]);
  }

  mapResults(orderIds: string[], users: UserByOrder[]): User[] {
    return orderIds.map((orderId) => {
      return users.find((user) => user.orders.some((order) => order.id == orderId));
    });
  }
}
