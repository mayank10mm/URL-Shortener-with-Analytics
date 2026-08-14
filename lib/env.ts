import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const env = {
  get databaseUrl() {
    return required("DATABASE_URL");
  },
  get upstashRedisRestUrl() {
    return required("UPSTASH_REDIS_REST_URL");
  },
  get upstashRedisRestToken() {
    return required("UPSTASH_REDIS_REST_TOKEN");
  },
  get clerkSecretKey() {
    return required("CLERK_SECRET_KEY");
  },
  get clerkPublishableKey() {
    return required("NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY");
  },
  get appUrl() {
    const explicit = process.env.NEXT_PUBLIC_APP_URL;
    if (explicit) return explicit.replace(/\/$/, "");

    const productionHost = process.env.VERCEL_PROJECT_PRODUCTION_URL;
    if (productionHost) return `https://${productionHost.replace(/\/$/, "")}`;

    const deploymentHost = process.env.VERCEL_URL;
    if (deploymentHost) return `https://${deploymentHost.replace(/\/$/, "")}`;

    return "http://localhost:3000";
  },
};
