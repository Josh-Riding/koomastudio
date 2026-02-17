"use client";

import { useEffect, useState } from "react";
import { getProviders, signIn } from "next-auth/react";
import type { ClientSafeProvider } from "node_modules/next-auth/lib/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [showEmail, setShowEmail] = useState(false);
  const [providers, setProviders] = useState<
    Record<string, ClientSafeProvider>
  >({});

  useEffect(() => {
    getProviders()
      .then((res) => {
        if (res) setProviders(res);
      })
      .catch(console.error);
  }, []);

  const googleProvider = Object.values(providers).find(
    (p) => p.id === "google",
  );
  const otherProviders = Object.values(providers).filter(
    (p) => p.id !== "google" && p.id !== "resend",
  );

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Welcome to koomastudio</CardTitle>
          <CardDescription>Sign in to your account</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {googleProvider && (
            <Button
              onClick={() =>
                signIn(googleProvider.id, { callbackUrl: "/dashboard" })
              }
              className="w-full"
              size="lg"
            >
              Continue with Google
            </Button>
          )}

          <Button
            variant="outline"
            onClick={() => setShowEmail((prev) => !prev)}
            className="w-full"
          >
            {showEmail ? "Hide email option" : "Use email instead"}
          </Button>

          {showEmail && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                await signIn("resend", {
                  email,
                  callbackUrl: "/dashboard",
                });
              }}
              className="space-y-3"
            >
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
              <p className="text-sm text-muted-foreground">
                We&apos;ll email you a one-time link to sign in.
              </p>
              <Button type="submit" variant="secondary" className="w-full">
                Email me a sign-in link
              </Button>
            </form>
          )}

          {otherProviders.length > 0 && (
            <>
              <Separator />
              <p className="text-center text-sm text-muted-foreground">
                Or continue with
              </p>
              {otherProviders.map((provider) => (
                <Button
                  key={provider.id}
                  variant="secondary"
                  onClick={() =>
                    signIn(provider.id, { callbackUrl: "/dashboard" })
                  }
                  className="w-full"
                >
                  {provider.name}
                </Button>
              ))}
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
