import { z } from "zod";
import { eq, and, desc, or } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import {
  createTRPCRouter,
  protectedProcedure,
  publicProcedure,
} from "@/server/api/trpc";
import {
  posts,
  userSavedPosts,
  savedPostsToCollections,
  users,
} from "@/server/db/schema";
import { extractFromLinkedInInput } from "@/lib/extract-post";
import { getEffectiveStatus } from "./subscription";

const FREE_SAVE_LIMIT = 10;
const WINDOW_DAYS = 30;

export const savedPostsRouter = createTRPCRouter({
  extractFromUrl: publicProcedure
    .input(z.object({ url: z.string().min(1) }))
    .mutation(async ({ input }) => {
      const extracted = await extractFromLinkedInInput(input.url);
      if (!extracted) {
        return { success: false as const, error: "Could not extract post data. Please paste the content manually." };
      }
      return { success: true as const, data: extracted };
    }),

  save: protectedProcedure
    .input(
      z.object({
        content: z.string().min(1),
        authorName: z.string().nullable(),
        authorUrl: z.string().nullable(),
        postUrl: z.string().nullable(),
        embedUrl: z.string().nullable().optional(),
        mediaType: z.enum(["photo", "video", "carousel"]).nullable().optional(),
        ogImage: z.string().nullable(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        collectionIds: z.array(z.string().uuid()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check subscription + rate limit
      const userRecord = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: {
          subscriptionStatus: true,
          subscriptionPeriodEnd: true,
          postSaveCount: true,
          postSaveWindowStart: true,
        },
      });
      if (!userRecord) throw new TRPCError({ code: "UNAUTHORIZED" });

      const status = getEffectiveStatus(userRecord);

      if (status === "free") {
        const now = new Date();
        let savesUsed = userRecord.postSaveCount ?? 0;
        let windowStart = userRecord.postSaveWindowStart ?? now;

        const windowExpiry = new Date(windowStart);
        windowExpiry.setDate(windowExpiry.getDate() + WINDOW_DAYS);

        if (now > windowExpiry) {
          // Rolling window expired — reset
          savesUsed = 0;
          windowStart = now;
        }

        if (savesUsed >= FREE_SAVE_LIMIT) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: `You've reached your ${FREE_SAVE_LIMIT} post saves for the month. Upgrade to Pro for unlimited saves.`,
          });
        }

        // Increment counter
        await ctx.db
          .update(users)
          .set({
            postSaveCount: savesUsed + 1,
            postSaveWindowStart: windowStart,
          })
          .where(eq(users.id, ctx.session.user.id));
      }

      let postId: string;

      // Check if post already exists by URL
      if (input.postUrl) {
        const existing = await ctx.db.query.posts.findFirst({
          where: eq(posts.postUrl, input.postUrl),
        });
        if (existing) {
          postId = existing.id;
        } else {
          const [newPost] = await ctx.db
            .insert(posts)
            .values({
              content: input.content,
              authorName: input.authorName,
              authorUrl: input.authorUrl,
              postUrl: input.postUrl,
              embedUrl: input.embedUrl ?? null,
              mediaType: input.mediaType ?? null,
              ogImage: input.ogImage,
            })
            .returning();
          postId = newPost!.id;
        }
      } else {
        const [newPost] = await ctx.db
          .insert(posts)
          .values({
            content: input.content,
            authorName: input.authorName,
            authorUrl: input.authorUrl,
            embedUrl: input.embedUrl ?? null,
            mediaType: input.mediaType ?? null,
            ogImage: input.ogImage,
          })
          .returning();
        postId = newPost!.id;
      }

      // Create user_saved_posts link
      const [savedPost] = await ctx.db
        .insert(userSavedPosts)
        .values({
          userId: ctx.session.user.id,
          postId,
          tags: input.tags ?? [],
          notes: input.notes ?? null,
        })
        .returning();

      // Add to collections if specified
      if (input.collectionIds && input.collectionIds.length > 0) {
        await ctx.db.insert(savedPostsToCollections).values(
          input.collectionIds.map((collectionId) => ({
            userSavedPostId: savedPost!.id,
            collectionId,
          })),
        );
      }

      return savedPost;
    }),

  getAll: protectedProcedure
    .input(
      z
        .object({
          collectionId: z.string().uuid().optional(),
          search: z.string().optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      let savedPostIds: string[] | undefined;

      // Filter by collection if specified
      if (input?.collectionId) {
        const links = await ctx.db.query.savedPostsToCollections.findMany({
          where: eq(
            savedPostsToCollections.collectionId,
            input.collectionId,
          ),
        });
        savedPostIds = links.map((l) => l.userSavedPostId);
        if (savedPostIds.length === 0) return [];
      }

      const results = await ctx.db.query.userSavedPosts.findMany({
        where: and(
          eq(userSavedPosts.userId, ctx.session.user.id),
          ...(savedPostIds
            ? [
                or(
                  ...savedPostIds.map((id) => eq(userSavedPosts.id, id)),
                ),
              ]
            : []),
        ),
        with: {
          post: true,
          collections: {
            with: { collection: true },
          },
        },
        orderBy: [desc(userSavedPosts.createdAt)],
      });

      // Client-side search filter (for simplicity)
      if (input?.search) {
        const term = input.search.toLowerCase();
        return results.filter((r) => {
          const matchContent = r.post.content.toLowerCase().includes(term);
          const matchAuthor =
            r.post.authorName?.toLowerCase().includes(term) === true;
          const matchTags =
            r.tags?.some((t) => t.toLowerCase().includes(term)) === true;
          const matchNotes =
            r.notes?.toLowerCase().includes(term) === true;
          return matchContent || matchAuthor || matchTags || matchNotes;
        });
      }

      return results;
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      const result = await ctx.db.query.userSavedPosts.findFirst({
        where: and(
          eq(userSavedPosts.id, input.id),
          eq(userSavedPosts.userId, ctx.session.user.id),
        ),
        with: {
          post: true,
          collections: {
            with: { collection: true },
          },
        },
      });
      return result ?? null;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        tags: z.array(z.string()).optional(),
        notes: z.string().optional(),
        collectionIds: z.array(z.string().uuid()).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.userSavedPosts.findFirst({
        where: and(
          eq(userSavedPosts.id, input.id),
          eq(userSavedPosts.userId, ctx.session.user.id),
        ),
      });
      if (!existing) throw new Error("Post not found");

      await ctx.db
        .update(userSavedPosts)
        .set({
          ...(input.tags !== undefined && { tags: input.tags }),
          ...(input.notes !== undefined && { notes: input.notes }),
        })
        .where(eq(userSavedPosts.id, input.id));

      // Update collection links if specified
      if (input.collectionIds !== undefined) {
        await ctx.db
          .delete(savedPostsToCollections)
          .where(eq(savedPostsToCollections.userSavedPostId, input.id));

        if (input.collectionIds.length > 0) {
          await ctx.db.insert(savedPostsToCollections).values(
            input.collectionIds.map((collectionId) => ({
              userSavedPostId: input.id,
              collectionId,
            })),
          );
        }
      }

      return { success: true };
    }),

  unsave: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(savedPostsToCollections)
        .where(eq(savedPostsToCollections.userSavedPostId, input.id));

      await ctx.db
        .delete(userSavedPosts)
        .where(
          and(
            eq(userSavedPosts.id, input.id),
            eq(userSavedPosts.userId, ctx.session.user.id),
          ),
        );

      return { success: true };
    }),
});
