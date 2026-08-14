import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/lib/env";
import * as schema from "@/lib/db/schema";

type Database = ReturnType<typeof drizzle<typeof schema>>;

let cached: Database | undefined;

export function getDb(): Database {
  if (!cached) {
    const sql = neon(env.databaseUrl);
    cached = drizzle({ client: sql, schema });
  }
  return cached;
}

export { schema };
