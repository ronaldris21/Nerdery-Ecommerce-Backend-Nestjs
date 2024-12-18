export interface JwtPayloadDto {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  iat: number; //  Issued at
  exp: number; // Expiration time
}
