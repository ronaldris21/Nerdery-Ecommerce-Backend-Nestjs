import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ThrottleContextGuard extends ThrottlerGuard {
  getRequestResponse(context: ExecutionContext): { req: any; res: any } {
    switch (context.getType<string>()) {
      case 'http': {
        const httpContext = context.switchToHttp();
        return {
          req: httpContext.getRequest(),
          res: httpContext.getResponse(),
        };
      }
      case 'graphql': {
        const graphqlContext = GqlExecutionContext.create(context).getContext();
        const req = graphqlContext.req || graphqlContext.request; // Support both keys
        const res = graphqlContext.res || graphqlContext.response; // Support both keys
        if (!req) {
          throw new UnauthorizedException('Request object is missing in GraphQL context');
        }
        return { req, res };
      }
      default:
        throw new UnauthorizedException(`Unsupported context type: ${context.getType()}`);
    }
  }
}
