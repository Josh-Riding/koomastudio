import { NextResponse } from "next/server";
import { auth } from "@/server/auth";
import { getStripe } from "@/lib/stripe";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "@/env";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const appUrl = env.APP_URL ?? "http://localhost:3000";

  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { stripeCustomerId: true },
  });

  if (!userRecord?.stripeCustomerId) {
    return NextResponse.json(
      { error: "No billing account found" },
      { status: 400 },
    );
  }

  const portalSession = await getStripe().billingPortal.sessions.create({
    customer: userRecord.stripeCustomerId,
    return_url: `${appUrl}/settings`,
  });

  return NextResponse.json({ url: portalSession.url });
}
