import { readFileSync } from "fs";
import { type Config } from "drizzle-kit";

// Read SUPABASE_DATABASE_URL directly from .env without going through @/env validation
// so this config works even when running locally
function getSupabaseUrl(): string {
  const envContent = readFileSync(".env", "utf-8");
  const match = /^SUPABASE_DATABASE_URL="?([^"\n]+)"?/m.exec(envContent);
  if (!match?.[1]) {
    throw new Error("SUPABASE_DATABASE_URL not found in .env");
  }
  return match[1];
}

export default {
  schema: "./src/server/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.SUPABASE_DATABASE_URL ?? getSupabaseUrl(),
  },
  tablesFilter: ["t3tryouts_*"],
} satisfies Config;
