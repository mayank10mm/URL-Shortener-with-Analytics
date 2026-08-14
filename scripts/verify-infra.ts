import { config } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { Redis } from "@upstash/redis";

config({ path: ".env.local" });

const REDIS_PING_KEY = "urlshortener:__phase1_ping";

async function verifyNeon() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is missing");
  }

  const sql = neon(databaseUrl);
  const ping = await sql`select 1 as ok`;
  if (ping[0]?.ok !== 1) {
    throw new Error("Neon ping failed");
  }

  const tables = await sql`
    select table_name
    from information_schema.tables
    where table_schema = 'public'
      and table_name in ('links', 'clicks')
    order by table_name
  `;

  const names = tables.map((row) => String(row.table_name));
  if (!names.includes("links") || !names.includes("clicks")) {
    throw new Error(
      `Expected tables links and clicks. Found: ${names.join(", ") || "(none)"}`,
    );
  }

  console.log("Neon: connected. Tables present:", names.join(", "));
}

async function verifyRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Upstash Redis env vars are missing");
  }

  const redis = new Redis({ url, token });
  await redis.set(REDIS_PING_KEY, "ok", { ex: 60 });
  const value = await redis.get(REDIS_PING_KEY);
  await redis.del(REDIS_PING_KEY);

  if (value !== "ok") {
    throw new Error(`Redis GET mismatch. Expected "ok", got ${String(value)}`);
  }

  console.log("Redis: SET/GET/DEL succeeded with key", REDIS_PING_KEY);
}

async function main() {
  await verifyNeon();
  await verifyRedis();
  console.log("Phase 1 infra check passed.");
}

main().catch((error) => {
  console.error("Phase 1 infra check failed.");
  console.error(error);
  process.exit(1);
});
