"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import { ClientSafeProvider } from "node_modules/next-auth/lib/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [providers, setProviders] = useState<
    Record<string, ClientSafeProvider>
  >({});

  useEffect(() => {
    getProviders().then((res) => {
      if (res) setProviders(res);
    });
  }, []);

  const googleProvider = Object.values(providers).find(
    (p) => p.id === "google",
  );
  const otherProviders = Object.values(providers).filter(
    (p) => p.id !== "google",
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-indigo-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-center text-3xl font-extrabold text-indigo-700">
          Welcome to koomastudio!
        </h1>
        <h2 className="text-center text-xl font-semibold text-gray-700">
          Sign in to your account
        </h2>

        {googleProvider && (
          <button
            onClick={() => signIn(googleProvider.id, { callbackUrl: "/notes" })}
            className="w-full rounded-xl bg-indigo-600 p-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            Continue with Google
          </button>
        )}

        <button
          onClick={() => setShowEmail((prev) => !prev)}
          className="w-full rounded-xl border border-indigo-300 bg-white p-3 font-semibold text-indigo-600 transition hover:bg-indigo-50"
        >
          {showEmail ? "Hide email option" : "Use email instead"}
        </button>

        {showEmail && (
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await signIn("resend", { email, callbackUrl: "/notes" });
            }}
            className="space-y-4"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full rounded-xl border border-indigo-300 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
            <p className="text-sm text-gray-500">
              We'll email you a one-time link to sign in. No password needed.
            </p>
            <button
              type="submit"
              className="w-full rounded-xl bg-indigo-100 p-3 font-semibold text-indigo-800 transition hover:bg-indigo-200"
            >
              Email me a sign-in link
            </button>
          </form>
        )}

        {otherProviders.some((p) => p.id !== "resend") && (
          <>
            <div className="border-t pt-4 text-center text-sm text-gray-500">
              Or continue with
            </div>
            {otherProviders
              .filter((p) => p.id !== "resend")
              .map((provider) => (
                <button
                  key={provider.id}
                  onClick={() => signIn(provider.id, { callbackUrl: "/notes" })}
                  className="w-full rounded-xl bg-indigo-100 p-3 font-semibold text-indigo-800 transition hover:bg-indigo-200"
                >
                  {provider.name}
                </button>
              ))}
          </>
        )}
      </div>
    </main>
  );
}
