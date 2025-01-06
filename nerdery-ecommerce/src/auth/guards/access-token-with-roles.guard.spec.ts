import { ExecutionContext, ForbiddenException, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES } from 'src/common/constants';
import { getRequestFromContext } from 'src/common/helpers/context-request';
import { validUUID7 } from 'src/common/testing-mocks/helper-data';

import { ROLES_KEY } from '../decoratos/roles.decorator';
import { JwtPayloadDto } from '../dto/jwtPayload.dto';

import { AccessTokenWithRolesGuard } from './access-token-with-roles.guard';
import { AccessTokenGuard } from './access-token.guard';

jest.mock('src/common/helpers/context-request', () => ({
  getRequestFromContext: jest.fn(),
}));

describe('AccessTokenWithRolesGuard', () => {
  let guard: AccessTokenWithRolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new AccessTokenWithRolesGuard(reflector);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
    expect(reflector).toBeDefined();
  });

  function createMockExecutionContext(user: any) {
    return {
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
      getHandler: jest.fn(),
    } as unknown as ExecutionContext;
  }

  const userClientPayload: JwtPayloadDto = {
    userId: validUUID7,
    email: 'ris@gmail.com',
    exp: 1234567890,
    iat: 1234567890,
    roles: [ROLES.CLIENT],
    firstName: 'Ronald',
    lastName: 'Ris',
  };

  describe('canActivate', () => {
    it('should return false if user is not authenticated', async () => {
      jest.spyOn(AccessTokenGuard.prototype, 'canActivate').mockImplementation(async () => {
        return false;
      });
      const executionContext = createMockExecutionContext(null);

      const result = await guard.canActivate(executionContext);

      expect(result).toBe(false);
    });

    it('should return true if user is authenticated and no roles are required', async () => {
      jest.spyOn(AccessTokenGuard.prototype, 'canActivate').mockResolvedValueOnce(true);
      jest.spyOn(guard, 'checkRoles').mockResolvedValueOnce(true);
      const executionContext = createMockExecutionContext(userClientPayload);

      const result = await guard.canActivate(executionContext);

      expect(result).toBe(true);
    });

    it('should return true if user has one of the required roles', async () => {
      const requiredRoles = [ROLES.CLIENT, ROLES.MANAGER];
      jest.spyOn(reflector, 'get').mockReturnValueOnce(requiredRoles as string[]);
      const executionContext = createMockExecutionContext(userClientPayload);
      (getRequestFromContext as jest.Mock).mockReturnValue({ user: userClientPayload });

      const result = await guard.checkRoles(executionContext);

      expect(reflector.get).toHaveBeenCalledWith(ROLES_KEY, executionContext.getHandler());
      expect(result).toBe(true);
    });

    it('should throw ForbiddenException if user does not have any of the required roles', async () => {
      const requiredRoles = ['Wizard', 'Warrior'];
      jest.spyOn(reflector, 'get').mockReturnValueOnce(requiredRoles as string[]);
      const executionContext = createMockExecutionContext(userClientPayload);
      (getRequestFromContext as jest.Mock).mockReturnValue({ user: userClientPayload });

      await expect(guard.checkRoles(executionContext)).rejects.toThrow(ForbiddenException);

      expect(reflector.get).toHaveBeenCalledWith(ROLES_KEY, executionContext.getHandler());
    });

    it('should throw UnauthorizedException if user is missing in request', async () => {
      const requiredRoles = ['Wizard', 'Warrior'];
      jest.spyOn(reflector, 'get').mockReturnValueOnce(requiredRoles as string[]);
      const executionContext = createMockExecutionContext(null);
      (getRequestFromContext as jest.Mock).mockReturnValue({ user: null });

      await expect(guard.checkRoles(executionContext)).rejects.toThrow(UnauthorizedException);

      expect(reflector.get).toHaveBeenCalledWith(ROLES_KEY, executionContext.getHandler());
    });
  });
});
