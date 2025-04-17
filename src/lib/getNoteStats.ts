// lib/getNoteStats.ts
import { db } from "@/server/db";
import { notes } from "@/server/db/schema";
import { asc, desc, sql } from "drizzle-orm";

export async function getNoteStats() {
  const created = await db
    .select({
      date: sql<string>`date_trunc('day', ${notes.createdAt})`.as("date"),
      count: sql<number>`count(*)`.as("count"),
    })
    .from(notes)
    .groupBy(sql`date_trunc('day', ${notes.createdAt})`)
    .orderBy(asc(sql`date`));

  const updated = await db
    .select({
      date: sql<string>`date_trunc('day', ${notes.updatedAt})`.as("date"),
      count: sql<number>`count(*)`.as("count"),
    })
    .from(notes)
    .groupBy(sql`date_trunc('day', ${notes.updatedAt})`)
    .orderBy(asc(sql`date`));

  return { created, updated };
}
