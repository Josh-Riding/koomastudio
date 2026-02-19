import { auth } from "@/server/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  ArrowUpCircle,
  BookMarked,
  Sparkles,
  Check,
  Wand2,
  Clock,
  Lightbulb,
  Bot,
} from "lucide-react";

export default async function LandingPage() {
  const session = await auth();
  const ctaHref = session ? "/dashboard" : "/signin";

  return (
    <div className="flex flex-col">
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-white px-6 py-24 text-center md:py-36">
        <div className="relative mx-auto max-w-3xl">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-violet-400">
            koomastudio
          </p>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-foreground sm:text-5xl md:text-6xl">
            Build your LinkedIn presence faster
            <br />
            <span className="text-violet-400">
              with content that already performs.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            The gap between consuming and creating is killing your growth.
            koomastudio closes it — turning the viral posts you already read
            into content that actually sounds like you.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3">
            <Button
              asChild
              size="lg"
              className="bg-violet-600 px-8 text-white hover:bg-violet-700"
            >
              <Link href={ctaHref}>Start growing for free</Link>
            </Button>
            <p className="text-xs text-muted-foreground">
              No credit card required.
            </p>
          </div>
        </div>
      </section>

      {/* ── PAIN POINTS ──────────────────────────────────────── */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-5xl">
          <p className="mb-12 text-center text-sm font-semibold uppercase tracking-widest text-zinc-500">
            Sound familiar?
          </p>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <Clock className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">
                  You don&apos;t have time to keep up.
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  LinkedIn rewards consistency above everything else. But you
                  have a business to run, calls to take, and about 4 minutes of
                  spare thought a day. Posting consistently feels impossible.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <Lightbulb className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">
                  Ideas hit while scrolling. Vanish when drafting.
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  You read something great and think{" "}
                  <em>&quot;I should write about that.&quot;</em> Then you open
                  a blank post and forget everything. The idea was there — you
                  just needed to catch it.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
                  <Bot className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-bold">
                  You&apos;ve tried AI. It sounds like AI.
                </h3>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  &quot;As a seasoned professional, I believe...&quot; Your
                  audience can smell generic AI output from a mile away. The
                  tool that&apos;s supposed to help you is hurting your
                  credibility.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────── */}
      <section className="bg-white px-6 py-24">
        <div className="mx-auto max-w-5xl">
          <div className="mb-16 text-center">
            <h2 className="text-3xl font-extrabold text-foreground sm:text-4xl">
              From scroll to post in minutes.
            </h2>
            <p className="mt-3 text-muted-foreground">
              A four-step system that turns your reading habit into a content
              strategy.
            </p>
          </div>

          <div className="space-y-24">
            {/* STEP 1 — Extension */}
            <div className="flex flex-col items-center gap-10 md:flex-row">
              <div className="flex-1">
                <StepLabel n={1} />
                <h3 className="mt-3 text-2xl font-bold text-foreground">
                  Save anything. Without leaving LinkedIn.
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Our Chrome extension adds a single button to every post in
                  your LinkedIn feed. One click saves the post, author, and
                  context straight to your library. No copy-pasting. No new
                  tabs. Just{" "}
                  <span className="font-semibold text-violet-400">↑ ks</span>{" "}
                  and keep scrolling.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Installs in 30 seconds",
                    "Works on your feed and profiles",
                    "Tag and annotate as you save",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 shrink-0 text-violet-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Extension mockup */}
              <div className="flex w-full flex-col items-center gap-6 md:flex-1">
                <LinkedInButtonMockup />
                <ExtensionPopupMockup />
              </div>
            </div>

            {/* STEP 2 — Library */}
            <div className="flex flex-col items-center gap-10 md:flex-row-reverse">
              <div className="flex-1">
                <StepLabel n={2} />
                <h3 className="mt-3 text-2xl font-bold text-foreground">
                  Your library is your strategy.
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Every post you save is a signal. A topic that resonated with
                  you will resonate with your audience. Over time your library
                  becomes a map of what you actually stand for — and what you
                  should be writing about.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Browse by author, topic, or tags",
                    "See what themes keep showing up",
                    "Always know what to write about next",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 shrink-0 text-violet-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:flex-1">
                <LibraryMockup />
              </div>
            </div>

            {/* STEP 3 — Remix */}
            <div className="flex flex-col items-center gap-10 md:flex-row">
              <div className="flex-1">
                <StepLabel n={3} />
                <h3 className="mt-3 text-2xl font-bold text-foreground">
                  Give it direction. Get a real draft.
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Select one or more posts as inspiration. Type a sentence about
                  your angle. koomastudio remixes the ideas — not the words —
                  into a draft shaped by your LinkedIn Voice profile. The
                  thinking is borrowed. The content is yours.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "Mix multiple posts for richer angles",
                    "Your voice profile guides every remix",
                    "Not a copy — an original take on the ideas",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 shrink-0 text-violet-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:flex-1">
                <RemixMockup />
              </div>
            </div>

            {/* STEP 4 — Output */}
            <div className="flex flex-col items-center gap-10 md:flex-row-reverse">
              <div className="flex-1">
                <StepLabel n={4} />
                <h3 className="mt-3 text-2xl font-bold text-foreground">
                  Copy. Post. Done.
                </h3>
                <p className="mt-3 text-muted-foreground">
                  Your remix lands ready to post. Edit it, punch it up, or use
                  it as-is. Then copy it straight to LinkedIn. No export, no
                  download, no friction. Your streak stays alive.
                </p>
                <ul className="mt-4 space-y-2">
                  {[
                    "One-click copy to clipboard",
                    "Save drafts to come back to",
                    "Your full remix history, always accessible",
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <Check className="h-4 w-4 shrink-0 text-violet-400" />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="w-full md:flex-1">
                <OutputMockup />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── VOICE FEATURE ────────────────────────────────────── */}
      <section className="bg-white px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-950/60 to-zinc-900 p-8 md:p-12">
            <div className="grid gap-8 md:grid-cols-2 md:gap-16">
              <div>
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-violet-400">
                  The anti-slop feature
                </p>
                <h2 className="text-3xl font-extrabold text-white">
                  Set your voice once. Sound like yourself every time.
                </h2>
                <p className="mt-4 text-zinc-400">
                  Describe yourself — your industry, your tone, your audience —
                  and every remix is shaped by that context before you type a
                  word. The output isn&apos;t generic AI. It&apos;s a draft
                  written through the lens of who you actually are.
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-zinc-900 p-5">
                <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  Your LinkedIn Voice
                </p>
                <p className="text-sm italic leading-relaxed text-zinc-300">
                  &quot;I&apos;m a B2B SaaS founder focused on product-led
                  growth. My audience is startup operators and early-stage PMs.
                  I write directly, skip the fluff, and occasionally use dry
                  humor to make a point.&quot;
                </p>
                <div className="mt-4 flex items-center gap-2 text-xs text-violet-400">
                  <Check className="h-3.5 w-3.5" />
                  Applied to every remix automatically
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────── */}
      <section className="bg-white px-6 py-28 text-center">
        <div className="mx-auto max-w-2xl">
          <h2 className="text-4xl font-extrabold text-foreground sm:text-5xl">
            The algorithm rewards creators.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            You already have the ideas. You just need a system to get them out.
          </p>
          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              size="lg"
              className="bg-violet-600 px-10 py-6 text-base text-white hover:bg-violet-700"
            >
              <Link href={ctaHref}>Start creating free</Link>
            </Button>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Bring your own API key. No subscription required to start.
          </p>
        </div>
      </section>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function StepLabel({ n }: { n: number }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-600 text-xs font-bold text-white">
        {n}
      </span>
      <span className="text-xs font-semibold uppercase tracking-widest text-violet-400">
        Step {n}
      </span>
    </div>
  );
}

function LinkedInButtonMockup() {
  return (
    <div className="w-full max-w-sm overflow-hidden rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-xl">
      <div className="mb-3 flex items-center gap-2">
        <div className="h-9 w-9 rounded-full bg-zinc-700" />
        <div>
          <div className="h-2.5 w-28 rounded bg-zinc-700" />
          <div className="mt-1 h-2 w-20 rounded bg-zinc-800" />
        </div>
      </div>
      <div className="mb-4 space-y-1.5">
        <div className="h-2.5 w-full rounded bg-zinc-800" />
        <div className="h-2.5 w-5/6 rounded bg-zinc-800" />
        <div className="h-2.5 w-4/6 rounded bg-zinc-800" />
      </div>
      {/* Action bar with LinkedIn icons + ks button */}
      <div className="flex items-center gap-0.5 border-t border-white/5 pt-3">
        <div className="flex min-w-0 shrink items-center gap-1 rounded-full px-2 py-1.5 text-xs text-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10v12"/><path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88Z"/></svg>
          <span className="hidden sm:inline">Like</span>
        </div>
        <div className="flex min-w-0 shrink items-center gap-1 rounded-full px-2 py-1.5 text-xs text-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span className="hidden sm:inline">Comment</span>
        </div>
        <div className="flex min-w-0 shrink items-center gap-1 rounded-full px-2 py-1.5 text-xs text-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m17 2 4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="m7 22-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
          <span className="hidden sm:inline">Repost</span>
        </div>
        <div className="flex min-w-0 shrink items-center gap-1 rounded-full px-2 py-1.5 text-xs text-zinc-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
          <span className="hidden sm:inline">Send</span>
        </div>
        {/* The koomastudio button */}
        <div className="ml-auto flex shrink-0 items-center gap-1 rounded-full border border-violet-500/30 bg-violet-600/20 px-3 py-1.5 text-xs font-bold text-violet-400">
          <ArrowUpCircle className="h-3.5 w-3.5" />
          ks
        </div>
      </div>
    </div>
  );
}

function ExtensionPopupMockup() {
  return (
    <div className="w-full max-w-[240px] rounded-xl border border-white/10 bg-zinc-950 p-4 text-xs shadow-2xl">
      <div className="mb-3 flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/wave.png" alt="" className="h-4 w-4 invert" />
          <span className="bg-gradient-to-r from-violet-400 to-purple-300 bg-clip-text font-bold text-transparent">
            koomastudio
          </span>
        </div>
        <span className="rounded-full border border-emerald-800 bg-emerald-950 px-2 py-0.5 text-[10px] text-emerald-400">
          ● Connected
        </span>
      </div>
      <div>
        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
          Extension Token <span className="text-emerald-500">✓ saved</span>
        </p>
        <div className="rounded border border-emerald-800/50 bg-zinc-900 px-2 py-1.5 font-mono text-zinc-500">
          kst_••••••••••
        </div>
      </div>
    </div>
  );
}

function LibraryMockup() {
  const posts = [
    {
      author: "Sarah Chen",
      preview:
        "The best founders I know treat their LinkedIn like a product, not a diary...",
    },
    {
      author: "Marcus Reid",
      preview:
        "Consistency on LinkedIn isn't about posting every day. It's about showing up when...",
    },
    {
      author: "Priya Nair",
      preview:
        "Three years ago I had 200 followers. Here's the one thing that changed...",
    },
  ];
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-xl">
      <div className="mb-4 flex items-center justify-between">
        <h4 className="text-sm font-semibold text-white">Saved Posts</h4>
        <span className="text-xs text-zinc-500">24 posts</span>
      </div>
      <div className="space-y-2">
        {posts.map((p) => (
          <div
            key={p.author}
            className="cursor-pointer rounded-lg border border-white/5 bg-zinc-800/60 p-3 transition hover:border-violet-500/30"
          >
            <p className="mb-1 text-xs font-semibold text-zinc-300">
              {p.author}
            </p>
            <p className="line-clamp-2 text-xs text-zinc-500">{p.preview}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function RemixMockup() {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-xl">
      <div className="mb-4 grid grid-cols-2 gap-3">
        <div>
          <p className="mb-2 text-xs font-semibold text-zinc-400">
            Inspiration
          </p>
          <div className="rounded-lg border border-violet-500/40 bg-violet-950/20 p-2.5 text-xs text-zinc-400">
            <p className="mb-1 font-medium text-zinc-300">Sarah Chen</p>
            <p className="line-clamp-3">
              The best founders I know treat their LinkedIn like a product...
            </p>
            <Check className="mt-1.5 h-3 w-3 text-violet-400" />
          </div>
        </div>
        <div>
          <p className="mb-2 text-xs font-semibold text-zinc-400">
            Instructions
          </p>
          <div className="h-full rounded-lg border border-white/10 bg-zinc-800 p-2.5 text-xs italic text-zinc-400">
            &quot;Make it about my experience building a B2B tool — add a
            personal angle about shipping in public&quot;
          </div>
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          Generate Remix
        </div>
        <span className="text-[10px] text-violet-300">Anthropic Claude</span>
      </div>
    </div>
  );
}

function OutputMockup() {
  return (
    <div className="rounded-xl border border-white/10 bg-zinc-900 p-4 shadow-xl">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-semibold text-white">Your Remix</p>
        <div className="flex items-center gap-1.5 rounded-md bg-zinc-800 px-2.5 py-1 text-xs text-zinc-400">
          <BookMarked className="h-3 w-3" />
          Copy
        </div>
      </div>
      <div className="rounded-lg border border-white/5 bg-zinc-800/60 p-4 text-sm leading-relaxed text-zinc-300">
        <p>
          I&apos;ve been building in public for 18 months. What nobody tells you
          is that shipping in the open isn&apos;t just a growth tactic.
        </p>
        <p className="mt-3">
          It&apos;s a forcing function. Every post about what I&apos;m working
          on forces me to actually be working on something worth posting about.
        </p>
        <p className="mt-3">
          Treat your LinkedIn like a product. Ship updates. Get feedback.
          Iterate.
        </p>
        <p className="mt-3 font-medium">
          Your audience doesn&apos;t want perfection. They want progress.
        </p>
      </div>
      <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-600">
        <Wand2 className="h-3 w-3" />
        Generated with your voice profile
      </div>
    </div>
  );
}
