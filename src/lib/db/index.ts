import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

const connectionString = process.env.DATABASE_URL.replace("?sslmode=require", "").replace("&sslmode=require", "").replace("sslmode=require", "");

// Use a global variable to preserve the pool across HMR reloads in development
// and prevent connection exhaustion in serverless environments
const globalForDb = globalThis as unknown as {
  pool: pg.Pool | undefined;
};

export const pool = globalForDb.pool ?? new Pool({ 
  connectionString,
  ssl: { rejectUnauthorized: false },
  max: 1, // Keep max connections low per lambda instance to prevent reaching the 15 limit
});

if (process.env.NODE_ENV !== "production") globalForDb.pool = pool;

export const db = drizzle(pool, { schema });

export * from "./schema";
