import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { apiKeys } from "@/server/db/schema";
import { encrypt, decrypt } from "@/lib/encryption";
import { env } from "@/env";

function getEncryptionKey(): string {
  const key = env.ENCRYPTION_KEY;
  if (!key) throw new Error("ENCRYPTION_KEY not configured");
  return key;
}

export const apiKeysRouter = createTRPCRouter({
  upsert: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["anthropic", "openai"]),
        key: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const encryptionKey = getEncryptionKey();
      const encryptedKey = encrypt(input.key, encryptionKey);

      const existing = await ctx.db.query.apiKeys.findFirst({
        where: and(
          eq(apiKeys.userId, ctx.session.user.id),
          eq(apiKeys.provider, input.provider),
        ),
      });

      if (existing) {
        await ctx.db
          .update(apiKeys)
          .set({ encryptedKey })
          .where(eq(apiKeys.id, existing.id));
      } else {
        await ctx.db.insert(apiKeys).values({
          userId: ctx.session.user.id,
          provider: input.provider,
          encryptedKey,
        });
      }

      return { success: true };
    }),

  list: protectedProcedure.query(async ({ ctx }) => {
    const keys = await ctx.db.query.apiKeys.findMany({
      where: eq(apiKeys.userId, ctx.session.user.id),
    });
    return keys.map((k) => ({
      id: k.id,
      provider: k.provider,
      createdAt: k.createdAt,
      updatedAt: k.updatedAt,
      // Return masked key hint
      keyHint: "••••" + decrypt(k.encryptedKey, getEncryptionKey()).slice(-4),
    }));
  }),

  delete: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .delete(apiKeys)
        .where(
          and(
            eq(apiKeys.id, input.id),
            eq(apiKeys.userId, ctx.session.user.id),
          ),
        );
      return { success: true };
    }),

  test: protectedProcedure
    .input(z.object({ provider: z.enum(["anthropic", "openai"]) }))
    .mutation(async ({ ctx, input }) => {
      const key = await ctx.db.query.apiKeys.findFirst({
        where: and(
          eq(apiKeys.userId, ctx.session.user.id),
          eq(apiKeys.provider, input.provider),
        ),
      });
      if (!key) throw new Error("No key found");

      const decryptedKey = decrypt(key.encryptedKey, getEncryptionKey());

      try {
        if (input.provider === "anthropic") {
          const Anthropic = (await import("@anthropic-ai/sdk")).default;
          const client = new Anthropic({ apiKey: decryptedKey });
          await client.messages.create({
            model: "claude-haiku-4-5-20251001",
            max_tokens: 10,
            messages: [{ role: "user", content: "Hi" }],
          });
          return { success: true, model: "claude-haiku-4-5-20251001" };
        } else {
          const OpenAI = (await import("openai")).default;
          const client = new OpenAI({ apiKey: decryptedKey });
          await client.chat.completions.create({
            model: "gpt-4o-mini",
            max_tokens: 10,
            messages: [{ role: "user", content: "Hi" }],
          });
          return { success: true, model: "gpt-4o-mini" };
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Invalid key";
        throw new Error(msg);
      }
    }),

  // Internal: get decrypted key for remix generation
  getDecrypted: protectedProcedure
    .input(z.object({ provider: z.enum(["anthropic", "openai"]) }))
    .query(async ({ ctx, input }) => {
      const key = await ctx.db.query.apiKeys.findFirst({
        where: and(
          eq(apiKeys.userId, ctx.session.user.id),
          eq(apiKeys.provider, input.provider),
        ),
      });
      if (!key) return null;
      return decrypt(key.encryptedKey, getEncryptionKey());
    }),
});
