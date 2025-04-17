import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { feedback } from "@/server/db/schema";
import { resend } from "@/lib/resend";

export const feedbackRouter = createTRPCRouter({
  submit: publicProcedure
    .input(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        message: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(feedback).values(input);

      await resend.emails.send({
        from: `Feedback Form <${process.env.FEEDBACK_EMAIL}>`,
        to: process.env.NOTIFICATIONS_EMAIL_KOOMA as string,
        subject: "New Contact Form Submission",
        text: `From: ${input.name} <${input.email}>\n\n${input.message}`,
      });

      return { success: true };
    }),
});
