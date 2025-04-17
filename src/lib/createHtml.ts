export function magicLinkHtml(url: string): string {
  return `
    <html lang="en"><head></head><body style="background-color: #eef2ff; margin: 0; padding: 2rem; font-family: Helvetica, Arial, sans-serif;">
      <table style="max-width: 500px; margin: auto; background: #fff; border-radius: 12px; padding: 2rem; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);">
        <tbody><tr>
          <td align="center">
            <h1 style="color: #4338ca; font-weight: 800; font-size: 24px;">Sign in to koomastudio</h1>
          </td>
        </tr>
        <tr>
          <td style="padding: 1rem 0; color: #374151; font-size: 16px;" align="center">
            Click the magic link below to sign in:
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top: 1rem;">
            <a href="${url}" style="display: inline-block; background: #6366f1; color: #fff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
              Sign in to koomastudio
            </a>
          </td>
        </tr>
        <tr>
          <td align="center" style="padding-top: 2rem; font-size: 12px; color: #9ca3af;">
            This link is valid for 24 hours. If you didn’t request this, you can safely ignore it.
          </td>
        </tr>
      </tbody></table>
    </body></html>
  `;
}
