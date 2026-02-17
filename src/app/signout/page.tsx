"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function SignOutPage() {
  return (
    <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <CardTitle className="text-2xl">See you soon</CardTitle>
          <CardDescription>
            Thanks for stopping by koomastudio!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full"
            size="lg"
          >
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
