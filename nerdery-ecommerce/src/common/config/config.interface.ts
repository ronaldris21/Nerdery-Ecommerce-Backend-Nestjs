export const ConfigNames = {
  cloudinary: 'cloudinary',
  email: 'email',
  graphql: 'graphql',
  jwt: 'jwt',
  nest: 'nest',
  cors: 'cors',
  frontend: 'frontend',
  redis: 'redis',
  env: 'env',
  prisma: 'prisma',
  stripeConfig: 'stripeConfig',
};

export interface Config {
  cloudinary: CloudinaryConfig;
  email: EmailConfig;
  graphql: GraphqlConfig;
  jwt: JwtConfig;
  nest: NestConfig;
  cors: CorsConfig;
  frontend: FrontendConfig;
  redis: RedisConfig;
  env: string;
  prisma: PrismaConfig;
  stripeConfig: StripeConfig;
}

export interface RedisConfig {
  host: string;
  port: number;
}

export interface FrontendConfig {
  resetPasswordFrontendUrl: string;
  paymentClientSecretFrontendUrl: string;
}

export interface CloudinaryConfig {
  name: string;
  apiKey: string;
  apiSecret: string;
}

//TODO: may need editing
export interface EmailConfig {
  credentials: {
    pass: string;
    user: string;
  };
  host: string;
  from: string;
}

export interface GraphqlConfig {
  playgroundEnabled: boolean;
  debug: boolean;
  schemaDestination: string;
  sortSchema: boolean;
}

export interface JwtConfig {
  expiresIn: string;
  refreshIn: string;
  bcryptSaltOrRound: string | number;
  jwtRefreshSecret: string;
  jwtAcccessSecret: string;
}

export interface NestConfig {
  port: number;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface PrismaConfig {
  dbConnection: string;
}

export interface StripeConfig {
  stripeKey: string;
  webhookSecret: string;
}
