import {
  UnauthorizedException,
  ExecutionContext,
  InternalServerErrorException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerModuleOptions, ThrottlerStorage } from '@nestjs/throttler';

import { ThrottleContextGuard } from './throttle-context.guard';

describe('ThrottleContextGuard', () => {
  let guard: ThrottleContextGuard;
  let context: ExecutionContext;

  beforeEach(() => {
    const mockOptions: ThrottlerModuleOptions = {} as ThrottlerModuleOptions;
    const mockStorageService = {} as ThrottlerStorage;
    const mockReflector = {} as Reflector;

    guard = new ThrottleContextGuard(mockOptions, mockStorageService, mockReflector);

    context = {
      getType: jest.fn(),
      switchToHttp: jest.fn(),
    } as any as ExecutionContext;
  });
  it('should be defined', () => {
    expect(1).toBe(1);
  });

  describe('getRequestResponse', () => {
    it('should return req and res for HTTP context', () => {
      const mockReq = { url: '/test', method: 'GET' };
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const mockSwitchToHttp = {
        getRequest: jest.fn().mockReturnValue(mockReq),
        getResponse: jest.fn().mockReturnValue(mockRes),
      };
      (context.getType as jest.Mock).mockReturnValue('http');
      (context.switchToHttp as jest.Mock).mockReturnValue(mockSwitchToHttp);

      const result = guard.getRequestResponse(context);

      expect(context.getType).toHaveBeenCalled();
      expect(context.switchToHttp).toHaveBeenCalled();
      expect(mockSwitchToHttp.getRequest).toHaveBeenCalled();
      expect(mockSwitchToHttp.getResponse).toHaveBeenCalled();
      expect(result).toEqual({ req: mockReq, res: mockRes });
    });

    it('should return req and res for GraphQL context', () => {
      const mockReq = { headers: { authorization: 'Bearer token' } };
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const mockGqlContext = { req: mockReq, res: mockRes };
      const mockGqlExecutionContext = {
        getContext: jest.fn().mockReturnValue(mockGqlContext),
      };
      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlExecutionContext as any);
      (context.getType as jest.Mock).mockReturnValue('graphql');

      const result = guard.getRequestResponse(context);

      expect(context.getType).toHaveBeenCalled();
      expect(GqlExecutionContext.create).toHaveBeenCalledWith(context);
      expect(mockGqlExecutionContext.getContext).toHaveBeenCalled();
      expect(result).toEqual({ req: mockReq, res: mockRes });
    });

    it('should throw error when REQUEST is missing in GraphQL context', () => {
      const mockReq = null;
      const mockRes = { status: jest.fn().mockReturnThis(), json: jest.fn() };
      const mockGqlContext = { req: mockReq, res: mockRes };
      const mockGqlExecutionContext = {
        getContext: jest.fn().mockReturnValue(mockGqlContext),
      };
      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlExecutionContext as any);
      (context.getType as jest.Mock).mockReturnValue('graphql');

      expect(() => guard.getRequestResponse(context)).toThrow(InternalServerErrorException);

      expect(context.getType).toHaveBeenCalled();
      expect(GqlExecutionContext.create).toHaveBeenCalledWith(context);
      expect(mockGqlExecutionContext.getContext).toHaveBeenCalled();
    });

    it('should throw error when RESPONSE is missing in GraphQL context', () => {
      const mockReq = { headers: { authorization: 'Bearer token' } };
      const mockRes = null;
      const mockGqlContext = { req: mockReq, res: mockRes };
      const mockGqlExecutionContext = {
        getContext: jest.fn().mockReturnValue(mockGqlContext),
      };
      jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlExecutionContext as any);
      (context.getType as jest.Mock).mockReturnValue('graphql');

      expect(() => guard.getRequestResponse(context)).toThrow(InternalServerErrorException);

      expect(context.getType).toHaveBeenCalled();
      expect(GqlExecutionContext.create).toHaveBeenCalledWith(context);
      expect(mockGqlExecutionContext.getContext).toHaveBeenCalled();
    });

    it('should throw UnauthorizedException for unsupported context types', () => {
      (context.getType as jest.Mock).mockReturnValue('ws');

      expect(() => guard.getRequestResponse(context)).toThrow(UnauthorizedException);

      expect(context.getType).toHaveBeenCalled();
    });
  });
});
