import { createMock, DeepMocked } from '@golevelup/ts-jest';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { ProductVariation, Product } from '@prisma/client';
import { ROLES } from 'src/common/constants';
import {
  validProductVariation1,
  validProductVariation2,
  validProduct1,
} from 'src/common/testing-mocks/helper-data';

import { AfterLoadersService } from './after-loaders.service';

describe('AfterLoadersService', () => {
  let service: DeepMocked<AfterLoadersService>;
  let jwtService: DeepMocked<JwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AfterLoadersService, { provide: JwtService, useValue: createMock<JwtService>() }],
    }).compile();

    service = module.get(AfterLoadersService);
    jwtService = module.get(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
    expect(jwtService).toBeDefined();
  });

  const productVariations: ProductVariation[] = [
    { ...validProductVariation1, isEnabled: true, isDeleted: false },
    { ...validProductVariation2, isEnabled: true, isDeleted: true },
    { ...validProductVariation2, isEnabled: false, isDeleted: true },
    { ...validProductVariation2, isEnabled: false, isDeleted: false },
  ];

  const products: Product[] = [
    { ...validProduct1, isEnabled: true, isDeleted: false },
    { ...validProduct1, isEnabled: true, isDeleted: true },
    { ...validProduct1, isEnabled: false, isDeleted: true },
    { ...validProduct1, isEnabled: false, isDeleted: false },
  ];

  describe('filterProductVariationsIfNoRequiredRole', () => {
    it('should return all product variations if the user has required roles', () => {
      jwtService.decode.mockReturnValue({
        roles: [ROLES.CLIENT, ROLES.MANAGER],
      });
      const result = service.filterProductVariationsIfNoRequiredRole(productVariations, 'token', [
        ROLES.MANAGER,
      ]);
      expect(result).toEqual(productVariations);
    });

    it('should filter product variations if the user does not have required roles', () => {
      jwtService.decode.mockReturnValue({ roles: [] });
      const result = service.filterProductVariationsIfNoRequiredRole(productVariations, 'token', [
        ROLES.MANAGER,
      ]);
      expect(result).toEqual([productVariations[0]]);
    });
  });

  describe('filterProductsIfNoRequiredRole', () => {
    it('should return all products if the user has required roles', () => {
      jwtService.decode.mockReturnValue({
        roles: [ROLES.MANAGER],
      });
      const result = service.filterProductsIfNoRequiredRole(products, 'token', [ROLES.MANAGER]);
      expect(result).toEqual(products);
    });

    it('should filter products if the user does not have required roles', () => {
      jwtService.decode.mockReturnValue({ roles: [] });
      const result = service.filterProductsIfNoRequiredRole(products, 'token', [ROLES.MANAGER]);
      expect(result).toEqual([products[0]]);
    });
  });

  describe('hasAnyRequiredRoles', () => {
    it('should return true if user has any of the required roles', () => {
      jwtService.decode.mockReturnValue({
        roles: [ROLES.CLIENT, ROLES.MANAGER],
      });
      const result = service.hasAnyRequiredRoles('token', [ROLES.MANAGER]);
      expect(result).toBe(true);
    });

    it('should return false if user does not have any of the required roles', () => {
      jwtService.decode.mockReturnValue({ roles: [] });
      const result = service.hasAnyRequiredRoles('token', [ROLES.MANAGER]);
      expect(result).toBe(false);
    });
  });

  describe('getRolesFromAccessToken', () => {
    it('should return roles from a valid token', () => {
      jwtService.decode.mockReturnValue({
        roles: [ROLES.MANAGER, ROLES.CLIENT],
      });
      const result = service.getRolesFromAccessToken('token');
      expect(result).toEqual([ROLES.MANAGER, ROLES.CLIENT]);
    });

    it('should return an empty array if the token is invalid', () => {
      jwtService.decode.mockImplementation(() => {
        throw new Error('Invalid token');
      });
      const result = service.getRolesFromAccessToken('invalid-token');
      expect(result).toEqual([]);
    });
  });
});
