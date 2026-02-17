import { auth } from "@/server/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Repeat2, Library, Sparkles } from "lucide-react";

export default async function LandingPage() {
  const session = await auth();

  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] flex-col items-center justify-center px-4">
      {/* Hero */}
      <section className="mx-auto max-w-2xl py-20 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          Remix LinkedIn content into your own voice
        </h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Save posts you admire, then use AI to remix them into original content
          that sounds like you. Your personal LinkedIn content studio.
        </p>
        <div className="mt-8">
          <Button asChild size="lg">
            <Link href={session ? "/dashboard" : "/signin"}>
              {session ? "Go to Dashboard" : "Get Started"}
            </Link>
          </Button>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto grid w-full max-w-4xl gap-6 pb-20 md:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <Library className="h-8 w-8 text-muted-foreground" />
            <h3 className="font-semibold">Save Posts</h3>
            <p className="text-sm text-muted-foreground">
              Build a library of LinkedIn posts that inspire you. Paste a URL or
              the content directly.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <Repeat2 className="h-8 w-8 text-muted-foreground" />
            <h3 className="font-semibold">Remix with AI</h3>
            <p className="text-sm text-muted-foreground">
              Select posts as inspiration and let AI help you create original
              content in your own style.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center gap-3 pt-6 text-center">
            <Sparkles className="h-8 w-8 text-muted-foreground" />
            <h3 className="font-semibold">Publish Confidently</h3>
            <p className="text-sm text-muted-foreground">
              Edit, refine, and copy your remixed content. Ready to post on
              LinkedIn whenever you are.
            </p>
          </CardContent>
        </Card>
      </section>
    </main>
  );
}
