import { ContextType, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const getRequestFromContext = (context: ExecutionContext) => {
  switch (context.getType()) {
    case 'http':
      return context.switchToHttp().getRequest();
    case 'graphql' as ContextType:
      const gqlContext = GqlExecutionContext.create(context);
      return gqlContext.getContext().req;

    default:
      throw new UnauthorizedException(`Unsupported context type: ${context.getType().toString()}`);
  }
};
