import Link from "next/link";

export default function SignInPrompt() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c] px-6 text-white">
      <div className="container flex flex-col items-center justify-center gap-10 py-16 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          🛑 Oops! You gotta sign in first.
        </h1>
        <p className="max-w-2xl text-xl font-medium opacity-90">
          You’re trying to get to the good stuff—but it’s just for signed-in
          folks. The good news? Signing in is <u>completely free</u>.
        </p>
        <Link
          href="/api/auth/signin"
          className="mt-8 rounded-full bg-[hsl(280,100%,70%)] px-10 py-3 text-lg font-bold text-white shadow-lg transition hover:bg-[hsl(280,100%,60%)]"
        >
          Sign In to Unlock Your Workspace
        </Link>
        <div className="grid w-full max-w-4xl grid-cols-1 gap-6 md:grid-cols-2">
          <div className="rounded-2xl bg-white/10 p-6 shadow-lg transition hover:shadow-xl">
            <h2 className="mb-2 text-xl font-semibold">
              🎨 Create & Save Instantly
            </h2>
            <p className="text-base opacity-80">
              Your ideas stay with you. Forever. No save button needed.
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-6 shadow-lg transition hover:shadow-xl">
            <h2 className="mb-2 text-xl font-semibold">🌍 Access Anywhere</h2>
            <p className="text-base opacity-80">
              Log in from any device and keep building without missing a beat.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
