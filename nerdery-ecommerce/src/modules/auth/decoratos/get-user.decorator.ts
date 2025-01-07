import { createParamDecorator, ExecutionContext, ContextType } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  let user = null;

  //TODO: on Grapqh check if this was the right way to get the user
  switch (ctx.getType()) {
    case 'http':
      user = ctx.switchToHttp().getRequest().user;
      break;
    case 'graphql' as ContextType:
      const gqlContext = GqlExecutionContext.create(ctx);
      user = gqlContext.getContext().req.user;
      break;
  }
  return user;
});
