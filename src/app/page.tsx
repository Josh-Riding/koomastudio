import { HydrateClient } from "@/trpc/server";
import { auth } from "@/server/auth";
import Link from "next/link";

export default async function landingPage() {
  const session = await auth();
  return (
    <HydrateClient>
      <main className="flex min-h-screen flex-col bg-gradient-to-b from-[#2e026d] to-[#15162c] text-white">
        <div className="flex flex-col items-center justify-center px-6 py-16">
          {/* Hero */}
          <section className="max-w-3xl text-center">
            <h2 className="text-5xl font-extrabold leading-tight sm:text-6xl">
              Effortless LinkedIn Content, From Idea to Post
            </h2>
            <p className="mt-4 text-xl opacity-90">
              Draft, organize, and publish standout content—all in one simple
              tool designed for creators who care about consistency.
            </p>
            <Link
              href={session ? "/notes" : "/api/auth/signin"}
              className="mt-8 inline-block rounded-full bg-[hsl(280,100%,70%)] px-8 py-3 text-lg font-semibold text-white shadow-lg hover:bg-[hsl(280,100%,60%)]"
            >
              {session ? "Go to Dashboard" : "Start Writing for Free"}
            </Link>
          </section>

          {/* Updated Hero section here */}

          {/* Features */}
          {/* Updated Features section here */}
          <div className="mt-16 grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-6 shadow-lg transition hover:shadow-xl">
              <h3 className="mb-2 text-2xl font-semibold">
                💡 Save Ideas Instantly
              </h3>
              <p className="text-lg opacity-80">
                Capture post ideas the moment they strike—no more lost
                inspiration.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 shadow-lg transition hover:shadow-xl">
              <h3 className="mb-2 text-2xl font-semibold">📂 Stay Organized</h3>
              <p className="text-lg opacity-80">
                See all your posts at a glance by topic. No more looking through
                unlabeled notes.
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-6 shadow-lg transition hover:shadow-xl">
              <h3 className="mb-2 text-2xl font-semibold">
                🚀 Polish & Publish
              </h3>
              <p className="text-lg opacity-80">
                Edit and export with confidence—your next viral post is ready.
              </p>
            </div>
          </div>

          {/* Social Proof Placeholder */}
          <section className="mt-16 max-w-3xl text-center opacity-80">
            <p className="text-lg italic">
              “Turns out LinkedIn doesn’t have drafts. So I built a whole
              product instead.”
            </p>
            <p className="mt-2 text-sm text-white/70">
              — Definitely not overreacting
            </p>
          </section>
        </div>
      </main>
    </HydrateClient>
  );
}
