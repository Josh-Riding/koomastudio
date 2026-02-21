import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/server/api/trpc";
import { resend } from "@/lib/resend";

export const supportRouter = createTRPCRouter({
  submit: protectedProcedure
    .input(
      z.object({
        subject: z.string().min(1).max(200),
        message: z.string().min(10).max(5000),
        category: z.enum(["bug", "billing", "feature", "other"]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const user = ctx.session.user;

      await resend.emails.send({
        from: "koomastudio <notify@koomastudio.com>",
        to: "notify@koomastudio.com",
        subject: `[Support] [${input.category}] ${input.subject}`,
        text: `From: ${user.name ?? "Unknown"} (${user.email ?? "no email"})\nCategory: ${input.category}\n\n${input.message}`,
      });

      return { ok: true };
    }),
});
