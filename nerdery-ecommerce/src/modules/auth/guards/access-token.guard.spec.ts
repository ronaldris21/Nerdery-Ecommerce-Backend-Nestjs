import { ExecutionContext } from '@nestjs/common';
import { ROLES } from 'src/common/constants';
import { getRequestFromContext } from 'src/common/helpers/context-request';
import { validUUID7 } from 'src/common/testing-mocks/helper-data';

import { JwtPayloadDto } from '../dto/response/jwtPayload.dto';

import { AccessTokenGuard } from './access-token.guard';

jest.mock('src/common/helpers/context-request', () => ({
  getRequestFromContext: jest.fn(),
}));

describe('AccessTokenGuard', () => {
  let guard: AccessTokenGuard;

  beforeEach(() => {
    guard = new AccessTokenGuard();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  function createMockExecutionContext(user: any): ExecutionContext {
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

  describe('getRequest', () => {
    it('should get the request and pass the request with the user', async () => {
      const executionContext = createMockExecutionContext(userClientPayload);
      (getRequestFromContext as jest.Mock).mockReturnValue({
        user: userClientPayload,
      });

      const result = await guard.getRequest(executionContext);

      expect(result.user).toBe(userClientPayload);
    });

    it('should get the request and pass the request with no user', async () => {
      const executionContext = createMockExecutionContext(userClientPayload);
      (getRequestFromContext as jest.Mock).mockReturnValue({ user: null });

      const result = await guard.getRequest(executionContext);

      expect(result.user).toBeNull();
    });
  });
});
