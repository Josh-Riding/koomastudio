import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { collections, savedPostsToCollections } from "@/server/db/schema";

export const collectionsRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [collection] = await ctx.db
        .insert(collections)
        .values({
          userId: ctx.session.user.id,
          name: input.name,
          description: input.description ?? null,
        })
        .returning();
      return collection;
    }),

  getAll: protectedProcedure.query(async ({ ctx }) => {
    return ctx.db.query.collections.findMany({
      where: eq(collections.userId, ctx.session.user.id),
      with: {
        savedPosts: true,
      },
    });
  }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(collections)
        .set({
          ...(input.name !== undefined && { name: input.name }),
          ...(input.description !== undefined && {
            description: input.description,
          }),
        })
        .where(
          and(
            eq(collections.id, input.id),
            eq(collections.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      // Junction rows cascade-delete automatically
      await ctx.db
        .delete(collections)
        .where(
          and(
            eq(collections.id, input.id),
            eq(collections.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  addPost: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        userSavedPostId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Verify ownership of both
      const collection = await ctx.db.query.collections.findFirst({
        where: and(
          eq(collections.id, input.collectionId),
          eq(collections.userId, ctx.session.user.id),
        ),
      });
      if (!collection) throw new Error("Collection not found");

      await ctx.db
        .insert(savedPostsToCollections)
        .values({
          userSavedPostId: input.userSavedPostId,
          collectionId: input.collectionId,
        })
        .onConflictDoNothing();

      return { success: true };
    }),

  removePost: protectedProcedure
    .input(
      z.object({
        collectionId: z.string().uuid(),
        userSavedPostId: z.string().uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(savedPostsToCollections)
        .where(
          and(
            eq(savedPostsToCollections.collectionId, input.collectionId),
            eq(
              savedPostsToCollections.userSavedPostId,
              input.userSavedPostId,
            ),
          ),
        );
      return { success: true };
    }),
});
