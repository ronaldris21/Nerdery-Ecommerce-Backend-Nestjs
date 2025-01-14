import { DeepMocked, createMock } from '@golevelup/ts-jest';
import { ConflictException, NotFoundException, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { Order, OrderStatusEnum, StripePayment, StripePaymentIntentEnum } from '@prisma/client';
import Decimal from 'decimal.js';
import { FrontendConfig, ConfigNames } from 'src/common/modules/config-env/config.interface';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
  validUUID1,
  validUUID2,
  validUUID3,
  validUUID4,
  validUUID5,
} from 'src/common/testing-mocks/helper-data';
import { StripeService } from 'src/modules/stripe/stripe.service';

import { StockReservationManagementService } from '../../common/services/stock-reservation-management/stock-reservation-management.service';
import { CartService } from '../cart/cart.service';
import { CartObject } from '../cart/entities/cart.entity';

import { ApprovedStatusPayload } from './dto/response/approved-status.object';
import { OrdersService } from './orders.service';

const mockPrismaService = {
  order: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    findMany: jest.fn(),
  },
  stripePayment: {
    findFirst: jest.fn(),
    create: jest.fn(),
  },
  cartItem: {
    deleteMany: jest.fn(),
  },
};

describe('OrdersService', () => {
  let service: OrdersService;
  let prismaService: typeof mockPrismaService;
  // let prismaService: DeepMocked<PrismaService>;
  let cartService: DeepMocked<CartService>;
  let stockReservationManagementService: DeepMocked<StockReservationManagementService>;
  let stripeService: DeepMocked<StripeService>;
  let configService: Partial<ConfigService>;

  const resetPasswordFrontendUrl = 'http://example.com/reset/';
  const paymentClientSecretFrontendUrl = 'http://example.com/payment?id=';

  beforeEach(async () => {
    const mockConfigService = {
      get: jest.fn().mockImplementation((key: string): Partial<FrontendConfig> => {
        if (key === ConfigNames.frontend) {
          return {
            resetPasswordFrontendUrl: resetPasswordFrontendUrl,
            paymentClientSecretFrontendUrl: paymentClientSecretFrontendUrl,
          };
        }
        return undefined;
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: PrismaService, useValue: createMock<PrismaService>() },
        { provide: CartService, useValue: createMock<CartService>() },
        {
          provide: StockReservationManagementService,
          useValue: createMock<StockReservationManagementService>(),
        },
        { provide: StripeService, useValue: createMock<StripeService>() },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get(PrismaService);
    cartService = module.get(CartService);
    stockReservationManagementService = module.get(StockReservationManagementService);
    stripeService = module.get(StripeService);
    configService = module.get(ConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(prismaService).toBeDefined();
    expect(cartService).toBeDefined();
    expect(stockReservationManagementService).toBeDefined();
    expect(stripeService).toBeDefined();
    expect(configService).toBeDefined();
  });

  const userId = validUUID2;
  const orderId = validUUID1;

  const mockCart: CartObject = {
    subTotal: new Decimal(287.07),
    discount: new Decimal(21.72),
    total: new Decimal(265.35),
    items: [
      {
        userId: '2e30d6d3-2986-4d3d-827d-5771ad836fba',
        productVariationId: '67062ffa-b66b-4b3e-ba09-342e0b9ebb80',
        quantity: 2,
        unitPrice: new Decimal(73.65),
        subTotal: new Decimal(147.3),
        discount: new Decimal(14.73),
        total: new Decimal(132.57),
        productVariation: null,
      },
      {
        userId: '2e30d6d3-2986-4d3d-827d-5771ad836fba',
        productVariationId: 'aefff0c5-04f7-49eb-ab6d-1ab34d1bef53',
        quantity: 3,
        unitPrice: new Decimal(46.59),
        subTotal: new Decimal(139.77),
        discount: new Decimal(6.99),
        total: new Decimal(132.78),
        productVariation: null,
      },
    ],
  };

  const mockOrderOnly: Order = {
    id: orderId,
    userId: userId,
    status: OrderStatusEnum.PAYMENT_APPROVED,
    subTotal: new Decimal(287.07),
    discount: new Decimal(21.72),
    total: new Decimal(265.35),
    currency: 'usd',
    isDeleted: false,
    isStockReserved: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockOrdersWithDetailsArray = [
    {
      ...mockOrderOnly,
      user: { id: userId, firstName: 'Ronald' },
      orderIncidents: [],
      orderItems: [
        {
          id: validUUID3,
          orderId: orderId,
          productVariationId: validUUID4,
          quantity: 2,
          unitPrice: new Decimal(73.65),
          subTotal: new Decimal(147.3),
          discount: new Decimal(14.73),
          total: new Decimal(132.57),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: validUUID3,
          orderId: orderId,
          productVariationId: validUUID4,
          quantity: 3,
          unitPrice: new Decimal(46.59),
          subTotal: new Decimal(139.77),
          discount: new Decimal(6.99),
          total: new Decimal(132.78),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ],
      stripePayments: [
        {
          id: validUUID5,
          orderId: orderId,
          amount: 300,
          currency: 'usd',
          webhookPaymentIntent: StripePaymentIntentEnum.SUCCEEDED,
          stripePaymentId: 'stripe-pi-1',
          webhookData: null,
          clientSecret: 'client_secret_1',
        },
      ],
    },
  ];

  const mockStripeResult = {
    id: 'stripe-payment-intent-id',
    status: 'requires_payment_method',
    client_secret: 'stripe-client-secret',
  };

  const mockStripePayment: StripePayment = {
    id: validUUID5,
    orderId: orderId,
    amount: mockOrderOnly.total,
    currency: 'usd',
    webhookPaymentIntent: StripePaymentIntentEnum.REQUIRES_PAYMENT_METHOD,
    stripePaymentId: mockStripeResult.id,
    clientSecret: mockStripeResult.client_secret,
    webhookData: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe('getPaymentApprovedStatus', () => {
    it('should return isApproved=true for PAYMENT_APPROVED status', async () => {
      jest.spyOn(service, 'getPaymentApprovedStatus').mockResolvedValue({
        isApproved: true,
        status: OrderStatusEnum.PAYMENT_APPROVED,
      });

      const result: ApprovedStatusPayload = await service.getPaymentApprovedStatus(orderId);

      expect(service.getPaymentApprovedStatus).toHaveBeenCalledWith(orderId);
      expect(result).toEqual({
        isApproved: true,
        status: OrderStatusEnum.PAYMENT_APPROVED,
      });
    });

    it('should return isApproved=true for COMPLETED status', async () => {
      const completedOrder = {
        ...mockOrderOnly,
        status: OrderStatusEnum.COMPLETED,
      };
      jest.spyOn(prismaService.order, 'findFirst').mockResolvedValue(completedOrder);

      const result = await service.getPaymentApprovedStatus(orderId);

      expect(prismaService.order.findFirst).toHaveBeenCalledWith({
        where: { id: orderId },
      });

      expect(result).toEqual({
        isApproved: true,
        status: OrderStatusEnum.COMPLETED,
      });
    });

    it('should return isApproved=false for WAITING_PAYMENT status', async () => {
      const waitingPaymentOrder = {
        ...mockOrderOnly,
        status: OrderStatusEnum.WAITING_PAYMENT,
      };
      jest.spyOn(prismaService.order, 'findFirst').mockResolvedValue(waitingPaymentOrder);

      const result: ApprovedStatusPayload = await service.getPaymentApprovedStatus(orderId);

      expect(prismaService.order.findFirst).toHaveBeenCalledWith({
        where: { id: orderId },
      });

      expect(result).toEqual({
        isApproved: false,
        status: OrderStatusEnum.WAITING_PAYMENT,
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      const nonExistentOrderId = 'nonexistent-order-id';
      jest.spyOn(prismaService.order, 'findFirst').mockResolvedValue(null);

      await expect(service.getPaymentApprovedStatus(nonExistentOrderId)).rejects.toThrow(
        NotFoundException,
      );

      expect(prismaService.order.findFirst).toHaveBeenCalledWith({
        where: { id: nonExistentOrderId },
      });
    });
  });

  describe('getOrders', () => {
    it('should retrieve orders for a user without admin privileges', async () => {
      jest.spyOn(prismaService.order, 'findMany').mockResolvedValue(mockOrdersWithDetailsArray);

      const result = await service.getOrders(userId);

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        include: {
          orderItems: true,
        },
      });
      expect(result).toEqual(mockOrdersWithDetailsArray);
    });

    it('should retrieve orders for a user with admin privileges with incidents if exists', async () => {
      prismaService.order.findMany.mockResolvedValue(mockOrdersWithDetailsArray);

      const result = await service.getOrders(userId);

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        include: {
          orderItems: true,
        },
      });
      expect(result).toEqual(mockOrdersWithDetailsArray);
    });

    it('should return an empty array if no orders are found', async () => {
      prismaService.order.findMany.mockResolvedValue([]);

      const result = await service.getOrders(userId);

      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        include: {
          orderItems: true,
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('createOrder', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('should create a new order successfully', async () => {
      jest.spyOn(cartService, 'myCart').mockResolvedValue(mockCart);
      prismaService.order.create.mockResolvedValue(mockOrdersWithDetailsArray[0]);
      stripeService.createPaymentIntent.mockResolvedValue(mockStripeResult as any);
      prismaService.stripePayment.create.mockResolvedValue(mockStripePayment);
      jest.spyOn(configService, 'get').mockReturnValue({
        resetPasswordFrontendUrl: resetPasswordFrontendUrl,
        paymentClientSecretFrontendUrl: paymentClientSecretFrontendUrl,
      });

      const expectedResponse = {
        ...mockOrdersWithDetailsArray[0],
        clientSecret: mockStripeResult.client_secret,
        paymentUrl: `${paymentClientSecretFrontendUrl}${mockStripeResult.client_secret}`,
      };

      const result = await service.createOrder(userId);

      expect(cartService.myCart).toHaveBeenCalledWith(userId);
      expect(prismaService.order.create).toHaveBeenCalledWith({
        include: { orderItems: true },
        data: {
          userId: userId,
          status: OrderStatusEnum.WAITING_PAYMENT,
          total: mockCart.total,
          subTotal: mockCart.subTotal,
          discount: mockCart.discount,
          currency: 'usd',
          isDeleted: false,
          isStockReserved: true,
          orderItems: {
            createMany: {
              data: mockCart.items.map((item) => ({
                productVariationId: item.productVariationId,
                quantity: item.quantity,
                unitPrice: item.unitPrice,
                discount: item.discount,
                subTotal: item.subTotal,
                total: item.total,
              })),
            },
          },
        },
      });
      expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(
        Number(mockOrdersWithDetailsArray[0].total),
        mockOrderOnly.id,
      );
      expect(prismaService.stripePayment.create).toHaveBeenCalledWith({
        data: {
          orderId: mockOrderOnly.id,
          amount: mockOrderOnly.total,
          currency: 'usd',
          webhookPaymentIntent: mockStripeResult.status as StripePaymentIntentEnum,
          stripePaymentId: mockStripeResult.id,
          webhookData: null,
          clientSecret: mockStripeResult.client_secret,
        },
      });
      expect(stockReservationManagementService.reserveStock).toHaveBeenCalledWith(mockCart.items);
      expect(cartService.deleteAllItems).toHaveBeenCalledWith(
        userId,
        mockCart.items.map((i) => i.productVariationId),
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException if cart has no items', async () => {
      cartService.myCart.mockResolvedValue({ ...mockCart, items: [] });

      await expect(service.createOrder(userId)).rejects.toThrow(NotFoundException);

      expect(cartService.myCart).toHaveBeenCalledWith(userId);
      expect(stockReservationManagementService.reserveStock).not.toHaveBeenCalled();
      expect(prismaService.order.create).not.toHaveBeenCalled();
      expect(stripeService.createPaymentIntent).not.toHaveBeenCalled();
      expect(prismaService.stripePayment.create).not.toHaveBeenCalled();
      expect(cartService.deleteAllItems).not.toHaveBeenCalled();
      expect(configService.get).not.toHaveBeenCalled();
    });

    it('should handle stock reservation failures', async () => {
      cartService.myCart.mockResolvedValue(mockCart);
      stockReservationManagementService.reserveStock.mockRejectedValue(
        new ConflictException('Stock reservation failed'),
      );

      await expect(service.createOrder(userId)).rejects.toThrow();

      expect(cartService.myCart).toHaveBeenCalledWith(userId);
      expect(stockReservationManagementService.reserveStock).toHaveBeenCalled();
      expect(prismaService.order.create).not.toHaveBeenCalled();
      expect(stripeService.createPaymentIntent).not.toHaveBeenCalled();
      expect(prismaService.stripePayment.create).not.toHaveBeenCalled();
      expect(cartService.deleteAllItems).not.toHaveBeenCalled();
      expect(configService.get).not.toHaveBeenCalled();
    });

    it('should handle Prisma errors during order creation', async () => {
      cartService.myCart.mockResolvedValue(mockCart);
      prismaService.order.create.mockRejectedValue(new Error('Order creation failed'));

      await expect(service.createOrder(userId)).rejects.toThrow('Order creation failed');

      expect(cartService.myCart).toHaveBeenCalledWith(userId);
      expect(stockReservationManagementService.reserveStock).toHaveBeenCalled();
      expect(prismaService.order.create).toHaveBeenCalled();
      expect(stripeService.createPaymentIntent).not.toHaveBeenCalled();
      expect(prismaService.stripePayment.create).not.toHaveBeenCalled();
      expect(cartService.deleteAllItems).not.toHaveBeenCalled();
      expect(configService.get).not.toHaveBeenCalled();
    });

    it('should handle Stripe payment intent creation failures', async () => {
      cartService.myCart.mockResolvedValue(mockCart);
      prismaService.order.create.mockResolvedValue(mockOrderOnly);
      stripeService.createPaymentIntent.mockRejectedValue(
        new ServiceUnavailableException('Stripe error'),
      );

      await expect(service.createOrder(userId)).rejects.toThrow(ServiceUnavailableException);

      expect(cartService.myCart).toHaveBeenCalledWith(userId);
      expect(stockReservationManagementService.reserveStock).toHaveBeenCalledWith(mockCart.items);
      expect(prismaService.order.create).toHaveBeenCalled();
      expect(stripeService.createPaymentIntent).toHaveBeenCalledWith(
        Number(mockOrderOnly.total),
        mockOrderOnly.id,
      );
      expect(prismaService.stripePayment.create).not.toHaveBeenCalled();
      expect(cartService.deleteAllItems).not.toHaveBeenCalled();
      expect(configService.get).not.toHaveBeenCalled();
    });
  });

  describe('retryPayment', () => {
    beforeEach(() => {
      prismaService.order.findFirst.mockReset();
      prismaService.stripePayment.findFirst.mockReset();
    });

    const orderId = validUUID1;
    const nonExistentOrderId = 'nonexistent-order-id';

    const approvedOrder = {
      id: orderId,
      userId: validUUID2,
      status: OrderStatusEnum.COMPLETED,
      total: 300,
      subTotal: 280,
      discount: 20,
      currency: 'usd',
      isDeleted: false,
      isStockReserved: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const mockStripePayment = {
      id: validUUID3,
      orderId: orderId,
      amount: 300,
      currency: 'usd',
      webhookPaymentIntent: StripePaymentIntentEnum.REQUIRES_PAYMENT_METHOD,
      stripePaymentId: 'stripe-pi-2',
      webhookData: null,
      clientSecret: 'client_secret_2',
    };

    it('should return isPaymentNeeded=false if payment is approved', async () => {
      prismaService.order.findFirst.mockResolvedValue(approvedOrder);
      jest.spyOn(service, 'getPaymentApprovedStatus').mockResolvedValue({
        isApproved: true,
        status: OrderStatusEnum.PAYMENT_APPROVED,
      });

      const retryResult = await service.retryPayment(orderId);

      expect(service.getPaymentApprovedStatus).toHaveBeenCalledWith(orderId);
      expect(retryResult).toEqual(
        expect.objectContaining({
          isPaymentNeeded: false,
        }),
      );
    });

    it('should return payment needed with paymentUrl and clientSecret if payment is not approved', async () => {
      jest.spyOn(service, 'getPaymentApprovedStatus').mockResolvedValue({
        isApproved: false,
        status: OrderStatusEnum.WAITING_PAYMENT,
      });
      jest.spyOn(prismaService.stripePayment, 'findFirst').mockResolvedValue(mockStripePayment);
      jest.spyOn(configService, 'get').mockReturnValue({
        resetPasswordFrontendUrl: resetPasswordFrontendUrl,
        paymentClientSecretFrontendUrl: paymentClientSecretFrontendUrl,
      });

      const retryResult = await service.retryPayment(orderId);

      expect(service.getPaymentApprovedStatus).toHaveBeenCalledWith(orderId);
      expect(prismaService.stripePayment.findFirst).toHaveBeenCalledWith({
        where: { orderId: orderId },
      });
      expect(retryResult).toEqual({
        isPaymentNeeded: true,
        paymentUrl: `${paymentClientSecretFrontendUrl}${mockStripePayment.clientSecret}`,
        clientSecret: mockStripePayment.clientSecret,
      });
    });

    it('should throw NotFoundException if order does not exist', async () => {
      jest
        .spyOn(service, 'getPaymentApprovedStatus')
        .mockRejectedValue(new NotFoundException('Order not found'));

      await expect(service.retryPayment(nonExistentOrderId)).rejects.toThrow(NotFoundException);

      expect(prismaService.stripePayment.findFirst).not.toHaveBeenCalled();
      expect(configService.get).not.toHaveBeenCalled();
    });
  });
});
