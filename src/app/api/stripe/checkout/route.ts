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

  const priceId = env.STRIPE_PRO_PRICE_ID;
  if (!priceId) {
    return NextResponse.json(
      { error: "Stripe not configured" },
      { status: 500 },
    );
  }

  const appUrl = env.APP_URL ?? "http://localhost:3000";

  // Get or create Stripe customer
  const userRecord = await db.query.users.findFirst({
    where: eq(users.id, session.user.id),
    columns: { stripeCustomerId: true, email: true, name: true },
  });

  let customerId = userRecord?.stripeCustomerId;

  if (!customerId) {
    const customer = await getStripe().customers.create({
      email: userRecord?.email ?? undefined,
      name: userRecord?.name ?? undefined,
      metadata: { userId: session.user.id },
    });
    customerId = customer.id;
    await db
      .update(users)
      .set({ stripeCustomerId: customerId })
      .where(eq(users.id, session.user.id));
  }

  const checkoutSession = await getStripe().checkout.sessions.create({
    customer: customerId,
    mode: "subscription",
    payment_method_types: ["card"],
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${appUrl}/settings?upgrade=success`,
    cancel_url: `${appUrl}/pricing`,
    metadata: { userId: session.user.id },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    subscription_data: { metadata: { userId: session.user.id } } as any,
  });

  return NextResponse.json({ url: checkoutSession.url });
}
