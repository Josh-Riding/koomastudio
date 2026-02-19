import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const FREE_SAVE_LIMIT = 10;
const WINDOW_DAYS = 30;

/** Returns the effective subscription status, handling expired subscriptions. */
export function getEffectiveStatus(user: {
  subscriptionStatus: "free" | "pro";
  subscriptionPeriodEnd: Date | null;
}): "free" | "pro" {
  if (user.subscriptionStatus === "pro" && user.subscriptionPeriodEnd) {
    if (new Date() > user.subscriptionPeriodEnd) return "free";
  }
  return user.subscriptionStatus;
}

export const subscriptionRouter = createTRPCRouter({
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: {
        subscriptionStatus: true,
        subscriptionPeriodEnd: true,
        stripeSubscriptionId: true,
        postSaveCount: true,
        postSaveWindowStart: true,
      },
    });

    if (!user) throw new Error("User not found");

    const status = getEffectiveStatus(user);

    // Calculate saves remaining in rolling window
    const now = new Date();
    let savesUsed = user.postSaveCount ?? 0;
    const windowStart = user.postSaveWindowStart;
    if (windowStart) {
      const windowExpiry = new Date(windowStart);
      windowExpiry.setDate(windowExpiry.getDate() + WINDOW_DAYS);
      if (now > windowExpiry) {
        // Window expired — reset counts
        savesUsed = 0;
      }
    }

    const savesRemaining =
      status === "pro" ? null : Math.max(0, FREE_SAVE_LIMIT - savesUsed);

    return {
      status,
      isPro: status === "pro",
      subscriptionPeriodEnd: user.subscriptionPeriodEnd,
      // null means unlimited (pro)
      savesRemaining,
      savesUsed: status === "pro" ? null : savesUsed,
      saveLimit: status === "pro" ? null : FREE_SAVE_LIMIT,
      // Whether the sub was cancelled but still in paid period
      isCancelled:
        user.subscriptionStatus === "pro" &&
        !user.stripeSubscriptionId &&
        !!user.subscriptionPeriodEnd,
    };
  }),
});
