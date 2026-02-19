import { randomBytes, createHash } from "crypto";
import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { extensionTokens } from "@/server/db/schema";
import { eq, and } from "drizzle-orm";

function hashToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export const extensionTokensRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(100) }))
    .mutation(async ({ ctx, input }) => {
      const rawToken = "kst_" + randomBytes(32).toString("hex");
      const tokenHash = hashToken(rawToken);

      await ctx.db.insert(extensionTokens).values({
        userId: ctx.session.user.id,
        tokenHash,
        name: input.name,
      });

      // Return raw token once — never stored
      return { token: rawToken };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const tokens = await ctx.db
      .select({
        id: extensionTokens.id,
        name: extensionTokens.name,
        createdAt: extensionTokens.createdAt,
      })
      .from(extensionTokens)
      .where(eq(extensionTokens.userId, ctx.session.user.id));

    return tokens;
  }),

  revoke: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(extensionTokens)
        .where(
          and(
            eq(extensionTokens.id, input.id),
            eq(extensionTokens.userId, ctx.session.user.id),
          ),
        );

      return { success: true };
    }),
});
