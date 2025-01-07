export interface AuthResponseDto {
  accessToken: string;
  refreshToken: string;
  accessExp: number;
  refreshExp: number;
  iat: number;
  roles: string[];
}
