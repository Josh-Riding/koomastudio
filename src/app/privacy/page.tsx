export default function PrivacyPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 text-3xl font-bold">Privacy Policy</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Last updated: February 20, 2025
      </p>

      <div className="space-y-8 text-sm leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            1. Who we are
          </h2>
          <p>
            koomastudio (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is a
            LinkedIn content tool that helps users save, organise, and remix
            LinkedIn posts into original content. Our website is located at{" "}
            <a
              href="https://www.koomastudio.com"
              className="text-foreground underline underline-offset-2"
            >
              www.koomastudio.com
            </a>
            .
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            2. What data we collect
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium text-foreground">
                Account information
              </span>{" "}
              — your name and email address, provided when you sign in via
              Discord or Google (via OAuth).
            </li>
            <li>
              <span className="font-medium text-foreground">
                LinkedIn post content
              </span>{" "}
              — text, author name, and post URL of posts you explicitly choose
              to save using the web app or Chrome extension.
            </li>
            <li>
              <span className="font-medium text-foreground">API keys</span> — if
              you use Bring Your Own Key (BYOK), your API key is encrypted at
              rest using AES-256-GCM and never exposed in plaintext outside of
              the remix generation request.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Extension token
              </span>{" "}
              — a hashed authentication token stored locally in your browser via
              chrome.storage.local to authenticate the Chrome extension.
            </li>
            <li>
              <span className="font-medium text-foreground">
                LinkedIn Voice context
              </span>{" "}
              — optional background information you provide about yourself to
              personalise AI-generated content.
            </li>
            <li>
              <span className="font-medium text-foreground">
                Billing information
              </span>{" "}
              — if you subscribe to Pro, payment is handled entirely by Stripe.
              We store your Stripe customer ID and subscription status. We never
              see or store your card details.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            3. How we use your data
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              To provide the core functionality of the app — saving posts,
              generating remixes, and managing your library.
            </li>
            <li>To authenticate you and keep your account secure.</li>
            <li>To process subscription payments via Stripe.</li>
            <li>
              To personalise AI-generated content using your LinkedIn Voice
              context, if provided.
            </li>
          </ul>
          <p className="mt-3">
            We do not sell your data to third parties. We do not use your data
            for advertising. We do not use your data for any purpose unrelated
            to operating koomastudio.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            4. Chrome extension
          </h2>
          <p>
            The koomastudio Chrome extension injects a save button into LinkedIn
            pages. It only reads post content (text, author name, post URL) when
            you explicitly click the save button — it does not passively monitor
            your browsing activity, collect web history, or log keystrokes.
          </p>
          <p className="mt-2">
            Your extension token is stored locally in your browser using
            chrome.storage.local. It is sent to our servers only to authenticate
            save requests.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            5. Data storage and security
          </h2>
          <p>
            Your data is stored in a PostgreSQL database hosted on Supabase. API
            keys are encrypted at rest. We use HTTPS for all data in transit.
            Access to your data is restricted to authenticated requests only.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            6. Third-party services
          </h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <span className="font-medium text-foreground">Stripe</span> —
              payment processing. Subject to Stripe&apos;s privacy policy.
            </li>
            <li>
              <span className="font-medium text-foreground">OpenAI</span> — AI
              remix generation for Pro subscribers. Post content is sent to
              OpenAI&apos;s API to generate remixes. Subject to OpenAI&apos;s
              privacy policy.
            </li>
            <li>
              <span className="font-medium text-foreground">Anthropic</span> —
              AI remix generation for BYOK users using an Anthropic key. Subject
              to Anthropic&apos;s privacy policy.
            </li>
            <li>
              <span className="font-medium text-foreground">Supabase</span> —
              database hosting. Subject to Supabase&apos;s privacy policy.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            7. Your rights
          </h2>
          <p>
            You can delete your account and all associated data at any time by
            contacting us. You can revoke extension tokens at any time from the
            Settings page.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-base font-semibold text-foreground">
            8. Contact
          </h2>
          <p>
            If you have questions about this policy or your data, contact us at{" "}
            <a
              href="mailto:notify@koomastudio.com"
              className="text-foreground underline underline-offset-2"
            >
              notify@koomastudio.com
            </a>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
