import { ForbiddenException, RawBodyRequest, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { OrderStatusEnum } from '@prisma/client';
import { Request } from 'express';
import { ConfigNames, StripeConfig } from 'src/common/modules/config-env/config.interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { webhookPaymentIntent } from 'src/modules/orders/dto/webhook-payment-intent.enum';
import Stripe from 'stripe';

import { StripeService } from './stripe.service';

const mockPrismaService = {
  order: {
    update: jest.fn(),
  },
  stripePayment: {
    updateMany: jest.fn(),
  },
};

const stripeMock = {
  paymentIntents: {
    create: jest.fn(),
  },
  webhooks: {
    constructEvent: jest.fn(),
  },
};

jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => stripeMock);
});
describe('StripeService', () => {
  let service: StripeService;
  let configService: Partial<ConfigService>;
  let prismaService: typeof mockPrismaService;

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string): StripeConfig => {
        if (key === ConfigNames.stripeConfig) {
          return {
            stripeKey: 'sk_test_123',
            webhookSecret: 'whsec_123',
          };
        }
        return null;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StripeService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<StripeService>(StripeService);
    configService = module.get(ConfigService);
    prismaService = module.get(PrismaService);

    stripeMock.paymentIntents.create.mockReset();
    stripeMock.webhooks.constructEvent.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(configService).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(stripeMock).toBeDefined();
  });

  describe('createPaymentIntent', () => {
    const amount = 100;
    const orderId = 'order-123';
    const stripePaymentIntent: Stripe.PaymentIntent = {
      id: 'pi_1',
      object: 'payment_intent',
      amount: 10000,
      currency: 'usd',
      metadata: { orderId },
      status: 'requires_payment_method',
      client_secret: 'secret_123',
    } as any;

    it('should create a payment intent successfully', async () => {
      stripeMock.paymentIntents.create.mockResolvedValue(stripePaymentIntent);

      const result = await service.createPaymentIntent(amount, orderId);

      expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: { orderId },
        payment_method_types: ['card'],
      });

      expect(result).toEqual(stripePaymentIntent);
    });

    it('should throw ServiceUnavailableException on Stripe API error', async () => {
      stripeMock.paymentIntents.create.mockRejectedValue(new Error('Stripe API error'));

      await expect(service.createPaymentIntent(amount, orderId)).rejects.toThrow(
        ServiceUnavailableException,
      );

      expect(stripeMock.paymentIntents.create).toHaveBeenCalledWith({
        amount: Math.round(amount * 100),
        currency: 'usd',
        metadata: { orderId },
        payment_method_types: ['card'],
      });
    });
  });

  describe('handleWebhook', () => {
    const orderId = 'order-123';
    const paymentIntentId = 'pi_1';
    const stripePaymentIntent: Stripe.PaymentIntent = {
      id: paymentIntentId,
      object: 'payment_intent',
      amount: 10000,
      currency: 'usd',
      metadata: { orderId },
      status: 'succeeded',
      client_secret: 'secret_123',
    } as any;

    const stripeEvent: Stripe.Event = {
      id: 'evt_1',
      object: 'event',
      type: 'payment_intent.succeeded',
      data: {
        object: stripePaymentIntent,
      },
    } as any;

    const mockReq: RawBodyRequest<Request> = {
      headers: {
        'stripe-signature': 'signature_123',
      },
      rawBody: Buffer.from(JSON.stringify(stripeEvent)),
    } as any;

    it('should handle payment_intent.succeeded event successfully', async () => {
      stripeMock.webhooks.constructEvent.mockReturnValue(stripeEvent);
      prismaService.stripePayment.updateMany.mockResolvedValue({ count: 1 });
      prismaService.order.update.mockResolvedValue({
        id: orderId,
        status: OrderStatusEnum.PAYMENT_APPROVED,
      });

      await service.handleWebhook(mockReq as any);

      expect(stripeMock.webhooks.constructEvent).toHaveBeenCalledWith(
        mockReq.rawBody,
        'signature_123',
        'whsec_123',
      );
      expect(prismaService.stripePayment.updateMany).toHaveBeenCalledWith({
        where: { stripePaymentId: paymentIntentId },
        data: { webhookPaymentIntent: webhookPaymentIntent.SUCCEEDED },
      });
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatusEnum.PAYMENT_APPROVED },
      });
    });

    it('should handle payment_intent.payment_failed event successfully', async () => {
      const failedEvent: Stripe.Event = {
        ...stripeEvent,
        type: 'payment_intent.payment_failed',
        data: {
          object: {
            ...stripePaymentIntent,
            status: webhookPaymentIntent.PAYMENT_FAILED,
          },
        },
      } as any;
      const mockFailedReq: RawBodyRequest<Request> = {
        headers: {
          'stripe-signature': 'signature_456',
        },
        rawBody: Buffer.from(JSON.stringify(failedEvent)),
      } as any;
      stripeMock.webhooks.constructEvent.mockReturnValue(failedEvent);
      prismaService.stripePayment.updateMany.mockResolvedValue({ count: 1 });
      prismaService.order.update.mockResolvedValue({
        id: orderId,
        status: OrderStatusEnum.RETRY_PAYMENT,
      });

      await service.handleWebhook(mockFailedReq as any);

      expect(stripeMock.webhooks.constructEvent).toHaveBeenCalledWith(
        mockFailedReq.rawBody,
        'signature_456',
        'whsec_123',
      );
      expect(prismaService.stripePayment.updateMany).toHaveBeenCalledWith({
        where: { stripePaymentId: paymentIntentId },
        data: { webhookPaymentIntent: webhookPaymentIntent.PAYMENT_FAILED },
      });
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: orderId },
        data: { status: OrderStatusEnum.RETRY_PAYMENT },
      });
    });

    it('should throw ForbiddenException on invalid webhook signature', async () => {
      stripeMock.webhooks.constructEvent.mockImplementation(() => {
        throw new Error('Invalid signature');
      });

      await expect(service.handleWebhook(mockReq as any)).rejects.toThrow(ForbiddenException);

      expect(stripeMock.webhooks.constructEvent).toHaveBeenCalledWith(
        mockReq.rawBody,
        'signature_123',
        'whsec_123',
      );
    });
  });
});
