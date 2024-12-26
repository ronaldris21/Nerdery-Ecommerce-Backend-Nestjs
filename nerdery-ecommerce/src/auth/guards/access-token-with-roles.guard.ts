import {
    CanActivate,
    ExecutionContext,
    Injectable,
    ForbiddenException,
    ContextType,
    UnauthorizedException,
    BadGatewayException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtPayloadDto } from '../dto/jwtPayload.dto';
import { GqlExecutionContext } from '@nestjs/graphql';
import { AccessTokenGuard } from './access-token.guard';
import { ROLES_KEY } from '../decoratos/roles.decorator';

@Injectable()
export class AccessTokenWithRolesGuard extends AccessTokenGuard {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {


        const requiredRole = this.reflector.get<string>(
            ROLES_KEY,
            context.getHandler(),
        );

        console.log('requiredRole', requiredRole);
        if (!requiredRole) {
            return true;
        }

        const isAuthenticated = await super.canActivate(context);
        if (!isAuthenticated) {
            return false;
        }

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

        let user: JwtPayloadDto = request.user;
        if (!user) {
            throw new UnauthorizedException('User not authenticated');
        }

        if (!user.roles.includes(requiredRole)) {
            throw new ForbiddenException('User does not have the required role');
        }

        return true;
    }
}
