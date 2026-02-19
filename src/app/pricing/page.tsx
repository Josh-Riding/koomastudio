"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Check, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const FREE_FEATURES = [
  "Save up to 10 posts per month",
  "Unlimited remixes",
  "Bring your own API key (OpenAI / Anthropic)",
  "Collections & tags",
  "LinkedIn Voice context",
];

const PRO_FEATURES = [
  "Unlimited post saves",
  "Unlimited remixes",
  "Managed AI (no API key needed)",
  "Chrome extension access",
  "Collections & tags",
  "LinkedIn Voice context",
  "Priority support",
];

export default function PricingPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleUpgrade() {
    if (!session) {
      router.push("/signin");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/stripe/checkout", { method: "POST" });
      const data = (await res.json()) as { url?: string; error?: string };
      if (data.url) {
        window.location.href = data.url;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-16">
      <div className="mb-12 text-center">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">Pricing</h1>
        <p className="text-muted-foreground text-lg">
          Start free. Upgrade when you need more.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Free */}
        <Card className="border-border">
          <CardHeader>
            <CardTitle className="text-xl">Free</CardTitle>
            <CardDescription>Everything you need to get started.</CardDescription>
            <div className="mt-2">
              <span className="text-4xl font-bold">$0</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              {session ? "Current plan" : "Get started free"}
            </Button>
          </CardFooter>
        </Card>

        {/* Pro */}
        <Card className="border-2 border-black dark:border-white relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2">
            <Badge className="bg-black text-white dark:bg-white dark:text-black px-3 py-0.5 text-xs font-semibold">
              MOST POPULAR
            </Badge>
          </div>
          <CardHeader>
            <CardTitle className="text-xl">Pro</CardTitle>
            <CardDescription>
              Unlimited saves, managed AI, and the Chrome extension.
            </CardDescription>
            <div className="mt-2">
              <span className="text-4xl font-bold">$5</span>
              <span className="text-muted-foreground ml-1">/month</span>
            </div>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button
              className="w-full bg-purple-600 hover:bg-purple-700 text-white"
              onClick={handleUpgrade}
              disabled={loading}
            >
              {loading ? (
                "Redirecting..."
              ) : (
                <>
                  <Zap className="mr-2 h-4 w-4" />
                  Upgrade to Pro
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Cancel anytime. Access continues until the end of your billing period.
      </p>
    </main>
  );
}
