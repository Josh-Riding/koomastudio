"use client";

import { useState, useEffect, Suspense } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Key,
  Trash2,
  Loader2,
  CheckCircle2,
  XCircle,
  Copy,
  Check,
  AlertTriangle,
  Puzzle,
  UserCircle2,
  Zap,
  Lock,
  CreditCard,
  Calendar,
} from "lucide-react";
import { api } from "@/trpc/react";

const PROVIDER_MODELS: Record<string, string> = {
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4o",
};

function UpgradeSuccessBanner() {
  const searchParams = useSearchParams();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (searchParams.get("upgrade") === "success") setShow(true);
  }, [searchParams]);

  if (!show) return null;
  return (
    <div className="mb-6 rounded-lg border border-green-500/50 bg-green-500/10 p-4 flex items-center gap-3">
      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
      <p className="text-sm font-medium text-green-700 dark:text-green-400">
        Welcome to Pro! Your subscription is now active.
      </p>
    </div>
  );
}

export default function SettingsPage() {
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
      <h1 className="mb-8 text-2xl font-bold">Settings</h1>

      <Suspense fallback={null}>
        <UpgradeSuccessBanner />
      </Suspense>

      {/* Subscription */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Subscription
          </CardTitle>
        </CardHeader>
        <CardContent>
          <SubscriptionManager />
        </CardContent>
      </Card>

      {/* Account */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm">
            <span className="text-muted-foreground">Name:</span>{" "}
            {session.user.name ?? "—"}
          </p>
          <p className="text-sm">
            <span className="text-muted-foreground">Email:</span>{" "}
            {session.user.email ?? "—"}
          </p>
        </CardContent>
      </Card>

      {/* LinkedIn Voice */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCircle2 className="h-5 w-5" />
            LinkedIn Voice
          </CardTitle>
          <CardDescription>
            Describe your professional background, tone, and audience. This
            context is automatically included with every remix so you don&apos;t
            have to repeat yourself.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LinkedInContextManager />
        </CardContent>
      </Card>

      {/* API Keys (free users only) */}
      <ApiKeySection />

      {/* Extension Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            Chrome Extension
          </CardTitle>
          <CardDescription>
            Generate tokens for the koomastudio Chrome extension.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExtensionTokenManager />
        </CardContent>
      </Card>
    </main>
  );
}

function SubscriptionManager() {
  const [portalLoading, setPortalLoading] = useState(false);
  const { data: sub, isLoading } = api.subscription.getStatus.useQuery();

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  async function handlePortal() {
    setPortalLoading(true);
    try {
      const res = await fetch("/api/stripe/portal", { method: "POST" });
      const data = (await res.json()) as { url?: string };
      if (data.url) window.location.href = data.url;
    } finally {
      setPortalLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <p className="text-sm font-medium">Current plan</p>
            {sub?.isPro ? (
              <p className="text-xs text-muted-foreground">
                {sub.isCancelled
                  ? "Pro (cancelled)"
                  : "Pro — renews monthly"}
              </p>
            ) : (
              <p className="text-xs text-muted-foreground">
                {sub?.savesRemaining ?? 10} post saves remaining this month
              </p>
            )}
          </div>
        </div>
        <Badge
          variant={sub?.isPro ? "default" : "outline"}
          className={
            sub?.isPro
              ? "bg-black text-white dark:bg-white dark:text-black"
              : ""
          }
        >
          {sub?.isPro ? "Pro" : "Free"}
        </Badge>
      </div>

      {sub?.isPro && sub.subscriptionPeriodEnd && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Calendar className="h-3.5 w-3.5" />
          {sub.isCancelled ? (
            <span>
              Access until{" "}
              {new Date(sub.subscriptionPeriodEnd).toLocaleDateString()}
            </span>
          ) : (
            <span>
              Next renewal:{" "}
              {new Date(sub.subscriptionPeriodEnd).toLocaleDateString()}
            </span>
          )}
        </div>
      )}

      {sub?.isPro ? (
        <Button
          variant="outline"
          size="sm"
          onClick={handlePortal}
          disabled={portalLoading}
        >
          {portalLoading && <Loader2 className="mr-2 h-3 w-3 animate-spin" />}
          Manage billing
        </Button>
      ) : (
        <Button
          size="sm"
          className="bg-purple-600 hover:bg-purple-700 text-white"
          asChild
        >
          <Link href="/pricing">
            <Zap className="mr-2 h-3.5 w-3.5" />
            Upgrade to Pro
          </Link>
        </Button>
      )}
    </div>
  );
}

function ApiKeySection() {
  const { data: sub } = api.subscription.getStatus.useQuery();

  if (sub?.isPro) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>API Keys</CardTitle>
          <CardDescription>
            You&apos;re on Pro — koomastudio provides AI access. No API key
            needed.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Remixes use our managed OpenAI key included with your subscription.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>API Keys</CardTitle>
        <CardDescription>
          Bring your own API keys to use AI remixing. Keys are encrypted at
          rest.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ApiKeyManager />
      </CardContent>
    </Card>
  );
}

function LinkedInContextManager() {
  const utils = api.useUtils();
  const { data, isLoading } = api.userProfile.getContext.useQuery();
  const [value, setValue] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const displayValue = value ?? data?.linkedinContext ?? "";

  const updateMutation = api.userProfile.updateContext.useMutation({
    onSuccess: () => {
      void utils.userProfile.getContext.invalidate();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    },
  });

  if (isLoading) {
    return <p className="text-sm text-muted-foreground">Loading...</p>;
  }

  return (
    <div className="space-y-3">
      <Textarea
        placeholder={`e.g., "I'm a B2B SaaS founder focused on product-led growth. My audience is startup operators and PMs. I write in a direct, no-fluff style with occasional dry humor."`}
        value={displayValue}
        onChange={(e) => setValue(e.target.value)}
        rows={5}
        maxLength={2000}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          {displayValue.length}/2000 characters
        </p>
        <Button
          size="sm"
          onClick={() => updateMutation.mutate({ linkedinContext: displayValue })}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : saved ? (
            <Check className="mr-2 h-4 w-4 text-green-600" />
          ) : null}
          {saved ? "Saved!" : "Save"}
        </Button>
      </div>
    </div>
  );
}

function ExtensionTokenManager() {
  const { data: sub } = api.subscription.getStatus.useQuery();

  if (!sub?.isPro) {
    return (
      <div className="relative">
        {/* Blurred content behind overlay */}
        <div className="pointer-events-none select-none blur-sm opacity-40">
          <div className="space-y-4">
            <div className="rounded-lg border p-3 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">My MacBook</p>
                <p className="text-xs text-muted-foreground">Created Jan 1, 2025</p>
              </div>
              <div className="h-8 w-8 rounded bg-muted" />
            </div>
            <Separator />
            <div className="flex gap-2">
              <div className="flex-1 h-9 rounded-md bg-muted" />
              <div className="h-9 w-32 rounded-md bg-muted" />
            </div>
          </div>
        </div>

        {/* Overlay */}
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-lg">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-black dark:bg-white">
            <Lock className="h-5 w-5 text-white dark:text-black" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Pro feature</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upgrade to generate Chrome extension tokens.
            </p>
          </div>
          <Button
            size="sm"
            className="bg-purple-600 hover:bg-purple-700 text-white"
            asChild
          >
            <Link href="/pricing">
              <Zap className="mr-2 h-3.5 w-3.5" />
              Upgrade to Pro
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return <ExtensionTokenManagerInner />;
}

function ExtensionTokenManagerInner() {
  const [tokenName, setTokenName] = useState("");
  const [newToken, setNewToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const utils = api.useUtils();
  const { data: tokens, isLoading } = api.extensionTokens.list.useQuery();

  const generateMutation = api.extensionTokens.generate.useMutation({
    onSuccess: (data) => {
      void utils.extensionTokens.list.invalidate();
      setNewToken(data.token);
      setTokenName("");
    },
  });

  const revokeMutation = api.extensionTokens.revoke.useMutation({
    onSuccess: () => void utils.extensionTokens.list.invalidate(),
  });

  function handleCopy() {
    if (!newToken) return;
    void navigator.clipboard.writeText(newToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      {newToken && (
        <div className="rounded-lg border border-yellow-500/50 bg-yellow-500/10 p-4 space-y-3">
          <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">
              Copy this token now — it won&apos;t be shown again.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded bg-muted px-3 py-2 text-xs font-mono break-all">
              {newToken}
            </code>
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground"
            onClick={() => setNewToken(null)}
          >
            I&apos;ve copied it — dismiss
          </Button>
        </div>
      )}

      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading tokens...</p>
      )}
      {tokens?.map((t) => (
        <div
          key={t.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">{t.name}</p>
            <p className="text-xs text-muted-foreground">
              Created {new Date(t.createdAt).toLocaleDateString()}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => revokeMutation.mutate({ id: t.id })}
            disabled={revokeMutation.isPending}
            className="shrink-0 ml-2"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      {tokens?.length === 0 && !isLoading && (
        <p className="text-sm text-muted-foreground">No tokens yet.</p>
      )}

      <Separator />

      <div className="flex gap-2">
        <Input
          placeholder="Token name (e.g. My MacBook)"
          value={tokenName}
          onChange={(e) => setTokenName(e.target.value)}
          className="flex-1"
        />
        <Button
          size="sm"
          onClick={() => generateMutation.mutate({ name: tokenName })}
          disabled={generateMutation.isPending || !tokenName.trim()}
        >
          {generateMutation.isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Generate Token"
          )}
        </Button>
      </div>
    </div>
  );
}

function ApiKeyManager() {
  const [provider, setProvider] = useState<"anthropic" | "openai">("anthropic");
  const [keyValue, setKeyValue] = useState("");
  const [testResults, setTestResults] = useState<
    Record<string, "pending" | "ok" | "fail">
  >({});

  const utils = api.useUtils();
  const { data: keys, isLoading } = api.apiKeys.list.useQuery();

  const upsertMutation = api.apiKeys.upsert.useMutation({
    onSuccess: () => {
      void utils.apiKeys.list.invalidate();
      setKeyValue("");
    },
  });

  const deleteMutation = api.apiKeys.delete.useMutation({
    onSuccess: () => void utils.apiKeys.list.invalidate(),
  });

  const testMutation = api.apiKeys.test.useMutation({
    onMutate: ({ provider: p }) => {
      setTestResults((prev) => ({ ...prev, [p]: "pending" }));
    },
    onSuccess: (_, { provider: p }) => {
      setTestResults((prev) => ({ ...prev, [p]: "ok" }));
    },
    onError: (_, { provider: p }) => {
      setTestResults((prev) => ({ ...prev, [p]: "fail" }));
    },
  });

  return (
    <div className="space-y-4">
      {isLoading && (
        <p className="text-sm text-muted-foreground">Loading keys...</p>
      )}
      {keys?.map((k) => (
        <div
          key={k.id}
          className="flex items-center justify-between rounded-lg border p-3"
        >
          <div className="flex items-center gap-2 min-w-0">
            <Key className="h-4 w-4 shrink-0 text-muted-foreground" />
            <Badge variant="outline" className="shrink-0">{k.provider}</Badge>
            <span className="text-sm text-muted-foreground shrink-0">{k.keyHint}</span>
            <span className="text-xs text-muted-foreground truncate">
              · {PROVIDER_MODELS[k.provider]}
            </span>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            {testResults[k.provider] === "ok" && (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            )}
            {testResults[k.provider] === "fail" && (
              <XCircle className="h-4 w-4 text-destructive" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                testMutation.mutate({ provider: k.provider as "anthropic" | "openai" })
              }
              disabled={testResults[k.provider] === "pending"}
            >
              {testResults[k.provider] === "pending" ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                "Test"
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => deleteMutation.mutate({ id: k.id })}
              disabled={deleteMutation.isPending}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}

      <Separator />

      <div className="space-y-3">
        <div className="flex gap-2">
          <select
            value={provider}
            onChange={(e) =>
              setProvider(e.target.value as "anthropic" | "openai")
            }
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="anthropic">Anthropic</option>
            <option value="openai">OpenAI</option>
          </select>
          <Input
            type="password"
            placeholder="Paste API key..."
            value={keyValue}
            onChange={(e) => setKeyValue(e.target.value)}
            className="flex-1"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Will use{" "}
          <span className="font-medium">{PROVIDER_MODELS[provider]}</span> for
          remixing.
        </p>
        <Button
          onClick={() => upsertMutation.mutate({ provider, key: keyValue })}
          disabled={upsertMutation.isPending || !keyValue.trim()}
          size="sm"
        >
          {upsertMutation.isPending && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          Save Key
        </Button>
      </div>
    </div>
  );
}
