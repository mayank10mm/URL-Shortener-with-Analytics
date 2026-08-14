import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  databaseUrl: required("DATABASE_URL"),
  upstashRedisRestUrl: required("UPSTASH_REDIS_REST_URL"),
  upstashRedisRestToken: required("UPSTASH_REDIS_REST_TOKEN"),
  clerkSecretKey: required("CLERK_SECRET_KEY"),
  clerkPublishableKey: required("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"),
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
};
