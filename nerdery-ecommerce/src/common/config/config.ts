import { Config } from './config.interface';

const config: Config = {
  cors: {
    enabled: true,
  },
  email: {
    host: process.env.MAIL_HOST,
    from: process.env.MAIL_FROM,
    credentials: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  },
  graphql: {
    playgroundEnabled: true,
    debug: true,
    schemaDestination: './src/schema.graphql',
    sortSchema: true,
  },
  nest: {
    port: parseInt(process.env.PORT, 10) || 3000,
  },
  cloudinary: {
    name: process.env.CLOUDINARY_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },
  jwt: {
    bcryptSaltOrRound: process.env.SECURITY_BCRYPT_SALT_OR_ROUND || 10,
    expiresIn: process.env.JWT_EXPIRATION_IN,
    refreshIn: process.env.JWT_REFRESH_IN,
    jwtAcccessSecret: process.env.JWT_ACCESS_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  },
  frontend: {
    resetPasswordFrontendUrl: process.env.FRONTEND_RESET_PASSWORD_URL,
    paymentClientSecretFrontendUrl: process.env.FRONTEND_PAYMENT_CLIENT_SECRET_URL,
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
  env: process.env.NODE_ENV,
  prisma: {
    dbConnection: process.env.DATABASE_URL,
  },
  stripeConfig: {
    stripeKey: process.env.STRIPE_API_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
};

export default (): Config => config;
