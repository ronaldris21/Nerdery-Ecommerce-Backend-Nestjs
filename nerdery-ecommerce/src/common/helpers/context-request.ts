import {
    BadGatewayException,
    ContextType,
    ExecutionContext,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';

export const getRequestFromContext = (context: ExecutionContext) => {
    switch (context.getType()) {
        case 'http':
            return context.switchToHttp().getRequest();
        case 'graphql' as ContextType:
            const gqlContext = GqlExecutionContext.create(context);
            return gqlContext.getContext().req;

        default:
            throw new BadGatewayException(
                'Invalid context type, only http or graphql',
            );
    }
};
