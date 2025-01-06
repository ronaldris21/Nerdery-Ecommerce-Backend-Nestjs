import { Controller, Post, RawBodyRequest, Req, Res } from '@nestjs/common';
import { Response } from 'express';

import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('/webhook')
  async webhook(@Req() req: RawBodyRequest<Request>, @Res() res: Response) {
    await this.stripeService.handleWebhook(req);
    res.sendStatus(200);
  }
}
