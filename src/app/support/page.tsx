"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CheckCircle2, Loader2, LifeBuoy } from "lucide-react";
import { api } from "@/trpc/react";

const FAQ = [
  {
    q: "How do I connect the Chrome extension?",
    a: "Go to Settings → Chrome Extension, generate a token, then open the extension popup and paste it in. Click Save.",
  },
  {
    q: "What's included in the Free plan?",
    a: "Free users can save up to 10 posts per rolling 30-day window and use AI remixing with their own API key (Anthropic or OpenAI). The Chrome extension is a Pro feature.",
  },
  {
    q: "What do I get with Pro?",
    a: "Pro ($5/month) gives you unlimited post saves, access to our managed OpenAI key for remixing (no BYOK needed), and Chrome extension token support.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to Settings → Subscription and click 'Manage billing'. You can cancel from the Stripe portal — your access continues until the end of your billing period.",
  },
  {
    q: "My saved post count seems wrong.",
    a: "Post saves use a rolling 30-day window, not a calendar month. The counter resets 30 days after your first save in each window.",
  },
  {
    q: "The extension isn't injecting a Save button on LinkedIn.",
    a: "Make sure the extension is enabled and your token is saved in the popup. Try refreshing the LinkedIn page. If the issue persists, revoke and regenerate your token in Settings.",
  },
];

export default function SupportPage() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (!session) {
    redirect("/signin");
  }

  return (
    <main className="mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-2 text-2xl font-bold">Support</h1>
      <p className="mb-8 text-sm text-muted-foreground">
        Find answers below or send us a message.
      </p>

      {/* FAQ */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Frequently asked questions</CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {FAQ.map((item, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger className="text-sm text-left">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Contact form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <LifeBuoy className="h-5 w-5" />
            Contact support
          </CardTitle>
          <CardDescription>
            We&apos;ll get back to you at {session.user.email}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SupportForm />
        </CardContent>
      </Card>
    </main>
  );
}

function SupportForm() {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [category, setCategory] = useState<"bug" | "billing" | "feature" | "other">("bug");
  const [submitted, setSubmitted] = useState(false);

  const submitMutation = api.support.submit.useMutation({
    onSuccess: () => setSubmitted(true),
  });

  if (submitted) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-green-600" />
        <p className="font-medium">Message sent!</p>
        <p className="text-sm text-muted-foreground">
          We&apos;ll be in touch shortly.
        </p>
        <Button variant="outline" size="sm" onClick={() => setSubmitted(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        submitMutation.mutate({ subject, message, category });
      }}
    >
      <div className="space-y-1.5">
        <Label htmlFor="category">Category</Label>
        <Select
          value={category}
          onValueChange={(v) => setCategory(v as typeof category)}
        >
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="bug">Bug report</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="feature">Feature request</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="subject">Subject</Label>
        <Input
          id="subject"
          placeholder="Brief description of your issue"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          maxLength={200}
          required
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="message">Message</Label>
        <Textarea
          id="message"
          placeholder="Describe your issue in detail..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={5}
          maxLength={5000}
          required
        />
        <p className="text-xs text-muted-foreground text-right">
          {message.length}/5000
        </p>
      </div>

      {submitMutation.error && (
        <p className="text-sm text-destructive">
          Something went wrong. Please try again.
        </p>
      )}

      <Button
        type="submit"
        disabled={submitMutation.isPending || !subject.trim() || !message.trim()}
      >
        {submitMutation.isPending && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        Send message
      </Button>
    </form>
  );
}
