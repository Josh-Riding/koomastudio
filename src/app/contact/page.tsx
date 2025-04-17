"use client";

import { api } from "@/trpc/react";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function ContactForm() {
  const { data: session, status } = useSession();
  const [success, setSuccess] = useState(false);
  const submitContact = api.feedback.submit.useMutation({
    onSuccess: () => setSuccess(true),
  });

  if (status === "loading") return null;
  if (!session) redirect("/signin");

  return (
    <div className="relative z-0 flex min-h-screen items-center justify-center bg-gradient-to-br from-purple-500 via-indigo-600 to-purple-800 p-4">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const formData = new FormData(form);

          const data = {
            name: formData.get("name") as string,
            email: formData.get("email") as string,
            message: formData.get("message") as string,
          };

          submitContact.mutate(data);
        }}
        className="w-full max-w-lg space-y-6 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-2xl backdrop-blur-md"
      >
        <h2 className="text-center text-2xl font-bold text-white">
          Contact Us
        </h2>

        <input
          name="name"
          placeholder="Your Name"
          className="w-full rounded-lg bg-white/80 px-4 py-3 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
          required
        />

        <input
          name="email"
          placeholder="Your Email"
          type="email"
          className="w-full rounded-lg bg-white/80 px-4 py-3 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
          required
        />

        <textarea
          name="message"
          placeholder="Your Message"
          rows={5}
          className="w-full rounded-lg bg-white/80 px-4 py-3 text-black placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400"
          required
        />

        <button
          type="submit"
          disabled={submitContact.status === "pending"}
          className="w-full rounded-lg bg-white py-3 font-semibold text-purple-700 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitContact.status === "pending" ? "Sending..." : "Send Message"}
        </button>

        {success && (
          <p className="text-center text-sm text-green-300">
            Your message has been sent successfully!
          </p>
        )}
      </form>
    </div>
  );
}
