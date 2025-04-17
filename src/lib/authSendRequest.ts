import { magicLinkHtml } from "./createHtml";
type SendVerificationRequestParams = {
  identifier: string;
  url: string;
  provider: {
    from: string;
    server: string;
  };
};

export async function sendVerificationRequest({
  identifier: email,
  url,
  provider,
}: SendVerificationRequestParams) {
  const { host } = new URL(url);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.AUTH_RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: `koomastudio <${process.env.LOGIN_EMAIL}>`,
      to: email,
      subject: `Sign in to ${host}`,
      html: magicLinkHtml(url),
      text: `Sign in to ${host}\n${url}\n\n`,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json();
    throw new Error("Resend error: " + JSON.stringify(errorData));
  }
}
