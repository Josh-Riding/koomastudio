import { NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe";
import { db } from "@/server/db";
import { users } from "@/server/db/schema";
import { eq, or } from "drizzle-orm";
import { env } from "@/env";
import type Stripe from "stripe";

// Helper: get the relevant period end from subscription
function getPeriodEnd(subscription: Stripe.Subscription): Date | null {
  // If scheduled for cancellation, cancel_at is when access ends
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cancelAt = (subscription as any).cancel_at as number | null;
  if (cancelAt) return new Date(cancelAt * 1000);

  const item = subscription.items?.data?.[0];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const periodEnd = (item as any)?.current_period_end ?? (subscription as any).current_period_end;
  return periodEnd ? new Date(periodEnd * 1000) : null;
}

function isCancelScheduled(subscription: Stripe.Subscription): boolean {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cancelAt = (subscription as any).cancel_at as number | null;
  return subscription.cancel_at_period_end || !!cancelAt;
}

export async function POST(request: Request) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature");

  const webhookSecret = env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret || !signature) {
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 400 },
    );
  }

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object as Stripe.Checkout.Session;
      if (session.mode !== "subscription") break;

      // userId is stored on the checkout session metadata
      const userId = session.metadata?.userId;
      console.log("[webhook] checkout.session.completed userId:", userId, "metadata:", session.metadata);
      if (!userId) break;

      const subscriptionId =
        typeof session.subscription === "string"
          ? session.subscription
          : (session.subscription as { id?: string } | null)?.id;
      if (!subscriptionId) break;

      const subscription = await getStripe().subscriptions.retrieve(subscriptionId);

      await db
        .update(users)
        .set({
          subscriptionStatus: "pro",
          stripeSubscriptionId: subscription.id,
          subscriptionPeriodEnd: getPeriodEnd(subscription),
        })
        .where(eq(users.id, userId));

      console.log("[webhook] upgraded user", userId, "to pro");
      break;
    }

    case "customer.subscription.updated": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;
      if (!customerId) break;

      const isActive =
        subscription.status === "active" ||
        subscription.status === "trialing";

      // If cancellation scheduled, null the ID so UI shows "Access until X"
      const cancelScheduled = isCancelScheduled(subscription);

      await db
        .update(users)
        .set({
          subscriptionStatus: isActive ? "pro" : "free",
          stripeSubscriptionId: cancelScheduled ? null : subscription.id,
          subscriptionPeriodEnd: getPeriodEnd(subscription),
        })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }

    case "customer.subscription.deleted": {
      const subscription = event.data.object as Stripe.Subscription;
      const customerId = typeof subscription.customer === "string"
        ? subscription.customer
        : subscription.customer?.id;
      if (!customerId) break;

      await db
        .update(users)
        .set({
          stripeSubscriptionId: null,
          subscriptionPeriodEnd: getPeriodEnd(subscription),
        })
        .where(eq(users.stripeCustomerId, customerId));
      break;
    }
  }

  return NextResponse.json({ received: true });
}
