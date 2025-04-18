import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { Resend } from "resend";

const resend = new Resend(process.env.AUTH_RESEND_KEY);

export const notifyRouter = createTRPCRouter({
  email: publicProcedure
    .input(z.object({ email: z.string().email() }))
    .mutation(async ({ input }) => {
      await resend.emails.send({
        from: `koomastudio <${process.env.NOTIFY_EMAIL}>`,
        to: input.email,
        subject: "You're on the list!",
        html: `
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Thanks for Signing Up</title>
  </head>
  <body style="margin: 0; padding: 0; background-color: #eef2ff;">
    <table
      align="center"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="padding: 2rem 0; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif"
    >
      <tr>
        <td>
          <table
            align="center"
            cellpadding="0"
            cellspacing="0"
            width="100%"
            style="max-width: 500px; background-color: #ffffff; border-radius: 12px; padding: 2rem; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);"
          >
            <tr>
              <td align="center" style="padding-bottom: 1.5rem">
                <h1
                  style="margin: 0; font-size: 24px; color: #4338ca; font-weight: 800;"
                >
                  Welcome to koomastudio 🚀
                </h1>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-bottom: 1rem">
                <p style="font-size: 16px; color: #374151; line-height: 1.6">
                  Thanks for signing up. We'll notify you when<br />
                  <strong>koomastudio’s AI feature goes live</strong>.
                </p>
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 1.5rem">
                <a
                  href="https://koomastudio.com"
                  style="display: inline-block; padding: 12px 24px; background-color: #6366f1; color: #ffffff; font-weight: 600; border-radius: 8px; text-decoration: none;"
                  >Visit Site</a
                >
              </td>
            </tr>
            <tr>
              <td align="center" style="padding-top: 2rem; font-size: 12px; color: #9ca3af">
                You’re receiving this email because you signed up for updates from koomastudio.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`,
        text: `Welcome to koomastudio 🚀 Thanks for signing up. We'll notify you when our AI feature goes live`,
      });

      await resend.emails.send({
        from: `koomastudio <${process.env.NOTIFY_EMAIL}>`,
        to: process.env.NOTIFICATIONS_EMAIL_KOOMA!,
        subject: "Another person is interested in AI",
        text: `${input.email} wants to know when the feature goes live.`,
      });

      return { success: true };
    }),
});
