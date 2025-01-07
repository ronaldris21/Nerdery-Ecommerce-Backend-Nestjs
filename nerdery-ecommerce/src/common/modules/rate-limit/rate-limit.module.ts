import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { seconds, ThrottlerModule } from '@nestjs/throttler';

import { ThrottleContextGuard } from './guards/throttle-context.guard';

@Module({
  imports: [
    ThrottlerModule.forRoot({
      errorMessage(context, throttlerLimitDetail) {
        return `Too many request in a short period! Only ${throttlerLimitDetail.limit} request every ${throttlerLimitDetail.ttl / 1000} seconds.`;
      },
      throttlers: [
        {
          ttl: seconds(1),
          limit: 2,
        },
      ],
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottleContextGuard,
    },
  ],
})
export class RateLimitModule {}
