import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CartService {
  myCart() {
    throw new InternalServerErrorException('Not implemented');
  }
}
