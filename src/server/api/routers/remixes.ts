import { z } from "zod";
import { eq, and, desc } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import {
  remixes,
  remixSources,
  userSavedPosts,
  apiKeys,
  users,
} from "@/server/db/schema";
import { generateRemix } from "@/lib/ai/provider";
import { decrypt } from "@/lib/encryption";
import { env } from "@/env";
import { getEffectiveStatus } from "./subscription";

export const remixesRouter = createTRPCRouter({
  generate: protectedProcedure
    .input(
      z.object({
        savedPostIds: z.array(z.string().uuid()).min(1),
        prompt: z.string().min(1),
        provider: z.enum(["anthropic", "openai"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Get user record for subscription + context
      const userRecord = await ctx.db.query.users.findFirst({
        where: eq(users.id, ctx.session.user.id),
        columns: {
          linkedinContext: true,
          subscriptionStatus: true,
          subscriptionPeriodEnd: true,
        },
      });
      if (!userRecord) throw new Error("User not found");

      const isPro = getEffectiveStatus(userRecord) === "pro";

      let decryptedKey: string;
      let provider = input.provider;

      if (isPro) {
        // Pro: use managed OpenAI key
        const managedKey = env.OPENAI_API_KEY;
        if (!managedKey) throw new Error("Managed API key not configured");
        decryptedKey = managedKey;
        provider = "openai";
      } else {
        // Free: use BYOK
        const apiKeyRecord = await ctx.db.query.apiKeys.findFirst({
          where: and(
            eq(apiKeys.userId, ctx.session.user.id),
            eq(apiKeys.provider, input.provider),
          ),
        });
        if (!apiKeyRecord) {
          throw new Error(
            `No ${input.provider} API key found. Add one in Settings.`,
          );
        }
        const encryptionKey = env.ENCRYPTION_KEY;
        if (!encryptionKey) throw new Error("ENCRYPTION_KEY not configured");
        decryptedKey = decrypt(apiKeyRecord.encryptedKey, encryptionKey);
      }

      // Get the saved posts with their content
      const savedPostRecords = await Promise.all(
        input.savedPostIds.map((id) =>
          ctx.db.query.userSavedPosts.findFirst({
            where: and(
              eq(userSavedPosts.id, id),
              eq(userSavedPosts.userId, ctx.session.user.id),
            ),
            with: { post: true },
          }),
        ),
      );

      const validPosts = savedPostRecords.filter(Boolean);
      if (validPosts.length === 0) throw new Error("No valid posts found");

      const content = await generateRemix({
        posts: validPosts.map((sp) => ({
          content: sp!.post.content,
          authorName: sp!.post.authorName,
        })),
        prompt: input.prompt,
        apiKey: decryptedKey,
        provider,
        userContext: userRecord.linkedinContext,
      });

      // Save the remix
      const [remix] = await ctx.db
        .insert(remixes)
        .values({
          userId: ctx.session.user.id,
          content,
          promptUsed: input.prompt,
          status: "draft",
          aiProvider: provider,
        })
        .returning();

      // Save source links
      const postIds = [
        ...new Set(validPosts.map((sp) => sp!.post.id)),
      ];
      if (postIds.length > 0) {
        await ctx.db.insert(remixSources).values(
          postIds.map((postId) => ({
            remixId: remix!.id,
            postId,
          })),
        );
      }

      return remix;
    }),

  getAll: protectedProcedure
    .input(
      z
        .object({
          status: z.enum(["draft", "published"]).optional(),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      return ctx.db.query.remixes.findMany({
        where: and(
          eq(remixes.userId, ctx.session.user.id),
          ...(input?.status ? [eq(remixes.status, input.status)] : []),
        ),
        with: {
          sources: {
            with: { post: true },
          },
        },
        orderBy: [desc(remixes.createdAt)],
      });
    }),

  getById: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .query(async ({ ctx, input }) => {
      return ctx.db.query.remixes.findFirst({
        where: and(
          eq(remixes.id, input.id),
          eq(remixes.userId, ctx.session.user.id),
        ),
        with: {
          sources: {
            with: { post: true },
          },
        },
      });
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string().uuid(),
        content: z.string().optional(),
        status: z.enum(["draft", "published"]).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(remixes)
        .set({
          ...(input.content !== undefined && { content: input.content }),
          ...(input.status !== undefined && { status: input.status }),
        })
        .where(
          and(
            eq(remixes.id, input.id),
            eq(remixes.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(remixSources)
        .where(eq(remixSources.remixId, input.id));

      await ctx.db
        .delete(remixes)
        .where(
          and(
            eq(remixes.id, input.id),
            eq(remixes.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),
});
