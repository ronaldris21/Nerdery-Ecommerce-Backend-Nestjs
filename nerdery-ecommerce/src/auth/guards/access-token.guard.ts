import { Injectable, ExecutionContext, ContextType, BadGatewayException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class AccessTokenGuard extends AuthGuard('jwt') {
  getRequest(context: ExecutionContext) {
    let request = null;
    switch (context.getType()) {
      case 'http':
        request = context.switchToHttp().getRequest();
        break;
      case 'graphql' as ContextType:
        const gqlContext = GqlExecutionContext.create(context);
        request = gqlContext.getContext().req;
        break;

      default:
        throw new BadGatewayException('Invalid context type, only http or graphql');
    }
    return request;
  }
}
