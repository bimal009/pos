export const env = {
  DATABASE_URL: process.env.DATABASE_URL!,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL!,
  IMAGEKIT_PUBLIC_KEY: process.env.IMAGEKIT_PUBLIC_KEY!,
  IMAGEKIT_PRIVATE_KEY: process.env.IMAGEKIT_PRIVATE_KEY!,
  IMAGEKIT_URL_ENDPOINT: process.env.IMAGEKIT_URL_ENDPOINT!,
  NODE_ENV: process.env.NODE_ENV || "development",
  STARTER_PLAN_ID: process.env.STARTER_PLAN_ID!,
};
