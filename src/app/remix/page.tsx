"use client";

import { Suspense, useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Loader2, Copy, Check, X } from "lucide-react";
import { api } from "@/trpc/react";

export default function RemixPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
          <p className="text-muted-foreground">Loading...</p>
        </main>
      }
    >
      <RemixPageInner />
    </Suspense>
  );
}

function RemixPageInner() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const preselectedId = searchParams.get("postId");
  const preselectedIds = searchParams.get("postIds");

  const [selectedIds, setSelectedIds] = useState<string[]>(() => {
    if (preselectedIds) return preselectedIds.split(",").filter(Boolean);
    if (preselectedId) return [preselectedId];
    return [];
  });
  const [prompt, setPrompt] = useState("");
  const [provider, setProvider] = useState<"anthropic" | "openai">("anthropic");
  const [result, setResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

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
    <RemixWorkspace
      selectedIds={selectedIds}
      setSelectedIds={setSelectedIds}
      prompt={prompt}
      setPrompt={setPrompt}
      provider={provider}
      setProvider={setProvider}
      result={result}
      setResult={setResult}
      copied={copied}
      setCopied={setCopied}
    />
  );
}

function RemixWorkspace({
  selectedIds,
  setSelectedIds,
  prompt,
  setPrompt,
  provider,
  setProvider,
  result,
  setResult,
  copied,
  setCopied,
}: {
  selectedIds: string[];
  setSelectedIds: (ids: string[]) => void;
  prompt: string;
  setPrompt: (p: string) => void;
  provider: "anthropic" | "openai";
  setProvider: (p: "anthropic" | "openai") => void;
  result: string | null;
  setResult: (r: string | null) => void;
  copied: boolean;
  setCopied: (c: boolean) => void;
}) {
  const { data: savedPosts } = api.savedPosts.getAll.useQuery();
  const { data: keys } = api.apiKeys.list.useQuery();
  const { data: sub } = api.subscription.getStatus.useQuery();
  const generateMutation = api.remixes.generate.useMutation({
    onSuccess: (data) => {
      if (data) setResult(data.content);
    },
  });

  const isPro = sub?.isPro ?? false;
  const availableProviders = keys?.map((k) => k.provider) ?? [];

  // Auto-select first available provider (free users only)
  useEffect(() => {
    if (!isPro && keys !== undefined && availableProviders.length > 0 && !availableProviders.includes(provider)) {
      setProvider(availableProviders[0] as "anthropic" | "openai");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [keys, isPro]);

  function togglePost(id: string) {
    setSelectedIds(
      selectedIds.includes(id)
        ? selectedIds.filter((i) => i !== id)
        : [...selectedIds, id],
    );
  }

  async function handleCopy() {
    if (!result) return;
    await navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main>
      <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-2xl font-bold">Remix Workspace</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 min-w-0 w-full">
        {/* Left: Select posts */}
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <h2 className="text-lg font-semibold">Select Inspiration Posts</h2>
          {savedPosts?.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No saved posts yet. Save some posts first.
            </p>
          )}
          <div className="max-h-[400px] space-y-2 overflow-y-auto pr-1">
            {savedPosts?.map((sp) => (
              <div
                key={sp.id}
                onClick={() => togglePost(sp.id)}
                className={`cursor-pointer rounded-lg border p-3 transition ${
                  selectedIds.includes(sp.id)
                    ? "border-primary bg-accent"
                    : "hover:bg-muted"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {sp.post.authorName && (
                      <p className="text-xs font-medium">
                        {sp.post.authorName}
                      </p>
                    )}
                    <p className="line-clamp-2 text-sm text-muted-foreground">
                      {sp.post.content}
                    </p>
                  </div>
                  {selectedIds.includes(sp.id) && (
                    <Check className="h-4 w-4 shrink-0 text-primary" />
                  )}
                </div>
              </div>
            ))}
          </div>
          {selectedIds.length > 0 && (
            <p className="text-sm text-muted-foreground">
              {selectedIds.length} post{selectedIds.length > 1 ? "s" : ""}{" "}
              selected
            </p>
          )}
        </div>

        {/* Right: Prompt + Generate */}
        <div className="space-y-4 rounded-xl border bg-card p-4">
          <h2 className="text-lg font-semibold">Your Instructions</h2>
          <Textarea
            placeholder="e.g., Make this more conversational and add a personal anecdote about startups..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={4}
            className="resize-none"
          />
          {isPro ? (
            <p className="text-xs text-muted-foreground">
              Using managed OpenAI (GPT-4o) — included with Pro.
            </p>
          ) : availableProviders.length > 0 ? (
            <div className="flex items-center gap-3">
              <select
                value={provider}
                onChange={(e) =>
                  setProvider(e.target.value as "anthropic" | "openai")
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm sm:w-auto"
              >
                {availableProviders.includes("anthropic") && (
                  <option value="anthropic">Anthropic Claude</option>
                )}
                {availableProviders.includes("openai") && (
                  <option value="openai">OpenAI GPT-4o</option>
                )}
              </select>
            </div>
          ) : (
            <div className="rounded-md border border-dashed p-3 text-center">
              <p className="text-sm text-muted-foreground">
                No API keys configured.
              </p>
              <Button variant="link" size="sm" asChild className="mt-1">
                <Link href="/settings">Add one in Settings</Link>
              </Button>
            </div>
          )}
          <Button
            onClick={() =>
              generateMutation.mutate({
                savedPostIds: selectedIds,
                prompt,
                provider,
              })
            }
            disabled={
              generateMutation.isPending ||
              selectedIds.length === 0 ||
              !prompt.trim() ||
              (!isPro && !availableProviders.includes(provider))
            }
            className="w-full"
          >
            {generateMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            Generate Remix
          </Button>

          {generateMutation.error && (
            <p className="text-sm text-destructive">
              {generateMutation.error.message}
            </p>
          )}

          {/* Result */}
          {result && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-base">Your Remix</CardTitle>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => void handleCopy()}>
                    {copied ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setResult(null)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{result}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Selected post previews */}
      {selectedIds.length > 0 && (
        <div className="mt-8 space-y-4">
          <h2 className="text-lg font-semibold">Selected Posts</h2>
          <div className="grid gap-4 lg:grid-cols-2">
          {selectedIds.map((id) => {
            const sp = savedPosts?.find((p) => p.id === id);
            if (!sp) return null;
            return (
              <div key={id} className="rounded-lg border p-4">
                {sp.post.authorName && (
                  <p className="mb-2 text-sm font-medium">{sp.post.authorName}</p>
                )}
                {sp.post.embedUrl ? (
                  <div className="overflow-hidden rounded-md border">
                    <iframe
                      src={sp.post.embedUrl}
                      className="w-full"
                      height="400"
                      style={{ border: 0 }}
                      allowFullScreen
                      title={`Post by ${sp.post.authorName ?? "unknown"}`}
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap text-sm text-muted-foreground">
                    {sp.post.content}
                  </p>
                )}
              </div>
            );
          })}
          </div>
        </div>
      )}
      </div>
    </main>
  );
}
