import { z } from "zod";
import { eq } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { users } from "@/server/db/schema";

export const userProfileRouter = createTRPCRouter({
  getContext: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.query.users.findFirst({
      where: eq(users.id, ctx.session.user.id),
      columns: { linkedinContext: true },
    });
    return { linkedinContext: user?.linkedinContext ?? "" };
  }),

  updateContext: protectedProcedure
    .input(z.object({ linkedinContext: z.string().max(2000) }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(users)
        .set({ linkedinContext: input.linkedinContext || null })
        .where(eq(users.id, ctx.session.user.id));
      return { success: true };
    }),
});
