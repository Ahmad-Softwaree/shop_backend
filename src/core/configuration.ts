export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  COOKIE_NAME: string;
  RESEND_API_KEY: string;
  EMAIL_FROM?: string;
  STRIPE_SECRET_KEY?: string;
  FRONT_URL?: string;
  SUCCESS_URL?: string;
  CANCEL_URL?: string;
  STRIPE_WEBHOOK_SECRET?: string;
}

export default (): EnvironmentVariables => ({
  NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION,
  COOKIE_NAME: process.env.COOKIE_NAME,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  EMAIL_FROM: process.env.EMAIL_FROM,
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  FRONT_URL: process.env.FRONT_URL,
  SUCCESS_URL: process.env.SUCCESS_URL,
  CANCEL_URL: process.env.CANCEL_URL,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
});
