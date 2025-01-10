import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ProductVariation } from '@prisma/client';
import { checkAnyRequiredRoles } from 'src/common/helpers/utils';
import { JwtPayloadDto } from 'src/modules/auth/dto/response/jwtPayload.dto';

@Injectable()
export class AfterLoadersService {
  constructor(private readonly jwtService: JwtService) {}

  filterProductVariationsIfNoRequiredRole(
    productVariations: ProductVariation[],
    accessToken: string,
    requiredRoles: string[],
  ): ProductVariation[] {
    const userRoles = this.getRolesFromAccessToken(accessToken);
    const hasRequiredRoles = checkAnyRequiredRoles(userRoles, requiredRoles);
    if (hasRequiredRoles) {
      return productVariations;
    }
    return productVariations.filter((p) => p.isEnabled && !p.isDeleted);
  }

  hasAnyRequiredRoles(accessToken: string, requiredRoles: string[]): boolean {
    const userRoles = this.getRolesFromAccessToken(accessToken);
    return checkAnyRequiredRoles(userRoles, requiredRoles);
  }

  getRolesFromAccessToken(accessToken: string): string[] {
    try {
      const payload = this.jwtService.decode(accessToken) as JwtPayloadDto;
      return payload.roles ?? [];
      // eslint-disable-next-line unused-imports/no-unused-vars, @typescript-eslint/no-unused-vars
    } catch (error) {
      return [];
    }
  }
}
