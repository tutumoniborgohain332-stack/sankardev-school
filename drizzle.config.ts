import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/lib/db/schema/index.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: "postgres://postgres.rfoeighwfbkhslpwoxcg:A8kvX48ModZIZGHn@aws-1-ap-south-1.pooler.supabase.com:6543/postgres?sslmode=require",
  },
});
