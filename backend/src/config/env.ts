import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRY: z.string().default('15m') as z.ZodType<import('jsonwebtoken').SignOptions['expiresIn']>,
  JWT_REFRESH_EXPIRY: z.string().default('7d')  as z.ZodType<import('jsonwebtoken').SignOptions['expiresIn']>,
  
  PORT: z.string().default('5000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  
  FRONTEND_URL: z.string().url(),
  ALLOWED_ORIGINS: z.string(),
  
  STRIPE_SECRET_KEY: z.string(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
  STRIPE_SUCCESS_URL: z.string().url(),
  STRIPE_CANCEL_URL: z.string().url(),
  
  CLOUDINARY_CLOUD_NAME: z.string(),
  CLOUDINARY_API_KEY: z.string(),
  CLOUDINARY_API_SECRET: z.string(),
});

const parseEnv = () => {
  const parsed = envSchema.safeParse(process.env);
  
  if (!parsed.success) {
    console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
    throw new Error('Invalid environment variables');
  }
  
  return parsed.data;
};

export const env = parseEnv();

export default env;