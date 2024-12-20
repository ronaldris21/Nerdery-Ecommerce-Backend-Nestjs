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
  s3: {
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
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
  },
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT, 10),
  },
  env: process.env.NODE_ENV,
};

export default (): Config => config;
