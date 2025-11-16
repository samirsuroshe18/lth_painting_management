import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load base .env
dotenv.config();

const envFile = `.env.${process.env.NODE_ENV || 'development'}`;
dotenv.config({ path: join(__dirname, '../..', envFile) });

const required = [
  'ACCESS_TOKEN_SECRET',
  'REFRESH_TOKEN_SECRET',
  'MONGODB_URI'
];

const missing = required.filter(key => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 3000,

  jwt: {
    accessSecret: process.env.ACCESS_TOKEN_SECRET,
    refreshSecret: process.env.REFRESH_TOKEN_SECRET,
    accessExpiry: process.env.ACCESS_TOKEN_EXPIRY || '15m',
    refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY || '7d'
  },

  database: {
    url: process.env.MONGODB_URI
  },

  mail: {
    host: process.env.MAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT, 10),
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS,
  },

  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET,
  },

  cors: {
    origins: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:9002']
  },

  files: {
    maxSize: parseInt(process.env.MAX_FILE_SIZE, 10) || 5242880,
    allowedTypes: process.env.ALLOWED_FILE_TYPES?.split(',') || ['image/jpeg', 'image/png']
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100
  },

  session: {
    secret: process.env.SESSION_SECRET
  },

  cookie: {
    domain: process.env.COOKIE_DOMAIN,
    secure: process.env.COOKIE_SECURE === 'true',
    httpOnly: process.env.HTTP_ONLY === 'true',
    maxAge: parseInt(process.env.COOKIE_MAX_AGE, 10),
    sameSite: process.env.SAME_SITE === 'true'
  },

  server: {
    host: process.env.SERVER_HOST,
    baseUrl: process.env.BASE_URL
  },

  qr: {
    dataUrl: process.env.QR_CODE_DATA_URL
  },

  superAdmin: {
    name: process.env.SUPERADMIN_NAME,
    email: process.env.SUPERADMIN_EMAIL,
    password: process.env.SUPERADMIN_PASSWORD,
    role: process.env.SUPERADMIN_ROLE
  },

  isProd: process.env.NODE_ENV === 'production'
};

console.log('Configured CORS origins:', config.cors.origins);