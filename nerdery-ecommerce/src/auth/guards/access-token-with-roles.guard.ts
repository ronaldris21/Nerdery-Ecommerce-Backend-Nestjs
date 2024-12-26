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
import { getRequestFromContext } from 'src/common/helpers/context-request';

@Injectable()
export class AccessTokenWithRolesGuard extends AccessTokenGuard {
    constructor(private readonly reflector: Reflector) {
        super();
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        //First check if the user is authenticated
        const isAuthenticated = await super.canActivate(context);
        if (!isAuthenticated) {
            return false;
        }

        //Then check if the user has the required role
        const requiredRoles = this.reflector.get<string[]>(
            ROLES_KEY,
            context.getHandler(),
        );

        if (requiredRoles.length === 0) {
            return true;
        }

        let request = getRequestFromContext(context);

        let user: JwtPayloadDto = request.user;
        if (!user) {
            throw new UnauthorizedException('User not authenticated');
        }

        if (!user.roles.some(role => requiredRoles.includes(role))) {
            throw new ForbiddenException('User does not have the required role');
        }

        return true;
    }
}
