"use client";

import { signOut } from "next-auth/react";

export default function SignOutPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-indigo-50 p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl bg-white p-8 text-center shadow-xl">
        <h1 className="text-3xl font-extrabold text-indigo-700">
          See you soon 👋
        </h1>
        <p className="text-lg text-gray-700">
          Thanks for stopping by koomastudio!
        </p>

        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="w-full rounded-xl bg-indigo-600 p-3 font-semibold text-white transition hover:bg-indigo-700"
        >
          Sign Out
        </button>
      </div>
    </main>
  );
}
