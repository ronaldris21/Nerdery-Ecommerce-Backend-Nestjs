import {
  createParamDecorator,
  ExecutionContext,
  ContextType,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

//This is an alternative to get the user with the access token when it has expired or invalidated
export const GetAccessToken = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): string => {
    try {
      let request = null;
      switch (ctx.getType()) {
        case 'http':
          request = ctx.switchToHttp().getRequest();
          break;
        case 'graphql' as ContextType:
          const gqlContext = GqlExecutionContext.create(ctx);
          request = gqlContext.getContext().req;
          break;
      }

      if (!request) return null;
      const authHeader = request.headers['authorization'];
      return authHeader && authHeader.split(' ')[1];
    } catch (error) {
      return "";
    }
  },
);
