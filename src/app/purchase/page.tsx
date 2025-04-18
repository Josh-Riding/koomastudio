"use client";

import { useState } from "react";
import { api } from "@/trpc/react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

const aiFeatures = [
  "Edit posts for clarity and impact",
  "Get feedback on your CTA, hooks, and tone",
  "Generate post ideas based on your niche",
  "Analyze previous posts and draft in your unique style",
  "Get detailed insights on your LinkedIn content strategy",
  "Advanced AI-driven post suggestions",
];

export default function AIPage() {
  const { data: session, status } = useSession();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState("");

  const notify = api.notify.email.useMutation({
    onSuccess: () => {
      closeModal();
    },
  });

  if (status === "loading") return null;
  if (!session) redirect("/signin");

  const handleClick = () => setIsModalOpen(true);

  const closeModal = () => {
    setIsModalOpen(false);
    setEmail("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    notify.mutate({ email });
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-white px-6 py-16 text-center">
      <h1 className="mb-6 text-4xl font-extrabold text-indigo-600">
        Supercharge Your LinkedIn Content with AI ✨
      </h1>
      <p className="mb-10 max-w-2xl text-lg text-gray-700">
        For $20/month, you’ll unlock everything you need to write better posts,
        grow faster, and build a stronger personal brand—all with the help of
        AI.
      </p>

      <ul className="mb-12 w-full max-w-xl space-y-4 text-left text-gray-800">
        {aiFeatures.map((feature, index) => (
          <li
            key={index}
            className="rounded-lg bg-indigo-50 px-6 py-4 shadow-sm"
          >
            ✅ {feature}
          </li>
        ))}
      </ul>

      <button
        onClick={handleClick}
        className="rounded-full bg-purple-600 px-10 py-4 text-lg font-semibold text-white shadow-lg transition hover:bg-purple-700"
      >
        Get Early Access – $20/month
      </button>

      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={closeModal}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-8 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-3 text-2xl font-bold text-purple-600">
              🚧 Almost Ready!
            </h2>
            <p className="mb-4 text-gray-700">
              This feature isn’t live just yet, but we’re working on it. Drop
              your email and we’ll notify you the moment it launches.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-gray-300 px-4 py-2 text-gray-800 outline-none focus:border-purple-500"
              />

              {notify.error && (
                <p className="text-sm text-red-500">
                  Something went wrong. Please try again.
                </p>
              )}

              <button
                type="submit"
                disabled={notify.status === "pending"}
                className={`rounded-lg py-2 text-white transition ${
                  notify.status === "pending"
                    ? "cursor-not-allowed bg-purple-400"
                    : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {notify.status === "pending" ? "Sending..." : "Notify Me"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
