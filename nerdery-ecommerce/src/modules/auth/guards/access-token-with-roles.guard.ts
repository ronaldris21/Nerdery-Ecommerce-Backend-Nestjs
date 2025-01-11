import {
  ExecutionContext,
  Injectable,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { getRequestFromContext } from 'src/common/helpers/context-request';

import { ROLES_KEY } from '../decoratos/roles.decorator';
import { JwtPayloadDto } from '../dto/response/jwtPayload.dto';

import { AccessTokenGuard } from './access-token.guard';

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
    return this.checkRoles(context);
  }

  checkRoles(context: ExecutionContext): boolean {
    //Then check if the user has the required role
    const requiredRoles = this.reflector.get<string[]>(ROLES_KEY, context.getHandler());

    if (requiredRoles.length === 0) {
      return true;
    }

    const request = getRequestFromContext(context);

    const user: JwtPayloadDto = request.user;
    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    if (!user.roles.some((role) => requiredRoles.includes(role))) {
      throw new ForbiddenException(
        'User does not have the required role: ' + requiredRoles.join(' or ').toString(),
      );
    }
    return true;
  }
}
