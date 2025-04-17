"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

export default function Login() {
  const { data: session, status } = useSession();
  return (
    <Link
      href={session ? "/api/auth/signout" : "/api/auth/signin"}
      className="hover:text-indigo-600"
    >
      {session ? "🔐 Sign out" : "🔓 Sign in"}
    </Link>
  );
}
