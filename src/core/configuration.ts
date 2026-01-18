export interface EnvironmentVariables {
  NODE_ENV: 'development' | 'production' | 'test';
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRATION: string;
  COOKIE_NAME: string;
  RESEND_API_KEY: string;
  NEXT_PUBLIC_APP_URL: string;
  NEXT_PUBLIC_APP_NAME: string;
}

export default (): EnvironmentVariables => ({
  NODE_ENV: (process.env.NODE_ENV as any) || 'development',
  PORT: parseInt(process.env.PORT, 10) || 3000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRATION: process.env.JWT_EXPIRATION,
  COOKIE_NAME: process.env.COOKIE_NAME,
  RESEND_API_KEY: process.env.RESEND_API_KEY,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
});
