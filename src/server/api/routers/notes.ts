import { z } from "zod";

import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { notes } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export const notesRouter = createTRPCRouter({
  create: protectedProcedure
    .input(z.object({ draft_name: z.string(), draft: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(notes).values({
        draft_name: input.draft_name,
        draft: input.draft,
        createdById: ctx.session.user.id,
      });
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    const notes = await ctx.db.query.notes.findMany({
      where: (notes, { eq }) => eq(notes.createdById, ctx.session.user.id),
      orderBy: (notes, { desc }) => [desc(notes.createdAt)],
    });

    return notes ?? null;
  }),

  edit: protectedProcedure
    .input(
      z.object({ id: z.number(), draft_name: z.string(), draft: z.string() }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(notes)
        .set({
          draft_name: input.draft_name,
          draft: input.draft,
        })
        .where(eq(notes.id, input.id));
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const note = await ctx.db.query.notes.findFirst({
        where: eq(notes.id, input.id),
      });
      return note ?? null;
    }),

  deleteById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(notes).where(eq(notes.id, input.id));

      return { success: true };
    }),
});
