import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

import { getRequestFromContext } from './context-request';

describe('context-rquest -> getRequestFromContext', () => {
  let context: ExecutionContext;

  beforeEach(() => {
    context = {
      getType: jest.fn(),
      switchToHttp: jest.fn(),
    } as any as ExecutionContext;
  });

  it('should return HTTP request when context type is "http"', () => {
    const mockHttpRequest = { url: '/test', method: 'GET' };
    const mockSwitchToHttp = {
      getRequest: jest.fn().mockReturnValue(mockHttpRequest),
    };

    jest.spyOn(context, 'getType').mockReturnValue('http');
    jest.spyOn(context, 'switchToHttp').mockReturnValue(mockSwitchToHttp as any);

    const request = getRequestFromContext(context);

    expect(context.getType).toHaveBeenCalled();
    expect(context.switchToHttp).toHaveBeenCalled();
    expect(mockSwitchToHttp.getRequest).toHaveBeenCalled();
    expect(request).toBe(mockHttpRequest);
  });

  it('should return GraphQL request when context type is "graphql"', () => {
    const mockGqlRequest = { headers: { authorization: 'Bearer token' } };
    const mockGqlContext = { req: mockGqlRequest };
    const mockGqlExecutionContext = {
      getContext: jest.fn().mockReturnValue(mockGqlContext),
    };

    jest.spyOn(GqlExecutionContext, 'create').mockReturnValue(mockGqlExecutionContext as any);
    jest.spyOn(context, 'getType').mockReturnValue('graphql');
    const request = getRequestFromContext(context);

    expect(context.getType).toHaveBeenCalled();
    expect(GqlExecutionContext.create).toHaveBeenCalledWith(context);
    expect(mockGqlExecutionContext.getContext).toHaveBeenCalled();
    expect(request).toBe(mockGqlRequest);
  });

  it('should throw UnauthorizedException for unsupported context types', () => {
    (context.getType as jest.Mock).mockReturnValue('ws');

    expect(() => getRequestFromContext(context)).toThrow(UnauthorizedException);
    expect(context.getType).toHaveBeenCalled();
  });
});
