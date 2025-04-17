import { auth } from "@/server/auth";
import { redirect } from "next/navigation";
import { db } from "@/server/db";
import { notes, users } from "@/server/db/schema";
import { getNoteStats } from "@/lib/getNoteStats";
import React, { Suspense } from "react";
import { eq, count, desc } from "drizzle-orm";
import ClientDashboardToggle from "../_components/ClientDasbhoardToggle";

const NotesChart = React.lazy(() => import("../_components/NotesChart"));

export default async function AdminPage() {
  const session = await auth();

  if (!session || session.user.role !== "ADMIN") {
    redirect("/");
  }

  const adminUsers = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      noteCount: count(notes.id),
    })
    .from(users)
    .leftJoin(notes, eq(notes.createdById, users.id))
    .groupBy(users.id)
    .orderBy(desc(count(notes.id)));

  const { created, updated } = await getNoteStats();

  return (
    <main className="p-6">
      <div className="mx-auto max-w-4xl space-y-10">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>

        <Suspense fallback={<div>Loading...</div>}>
          <ClientDashboardToggle
            users={adminUsers}
            created={created}
            updated={updated}
          />
        </Suspense>
      </div>
    </main>
  );
}
