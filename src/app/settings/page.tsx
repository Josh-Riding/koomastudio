"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
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
import { Key, Trash2, Loader2, CheckCircle2, XCircle, Copy, Check, AlertTriangle, Puzzle, UserCircle2 } from "lucide-react";
import { api } from "@/trpc/react";

const PROVIDER_MODELS: Record<string, string> = {
  anthropic: "claude-sonnet-4-6",
  openai: "gpt-4o",
};

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

      {/* API Keys */}
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

      {/* Extension Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Puzzle className="h-5 w-5" />
            Chrome Extension
          </CardTitle>
          <CardDescription>
            Generate tokens for the koomastudio Chrome extension. Tokens are
            shown once and stored hashed — treat them like passwords.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ExtensionTokenManager />
        </CardContent>
      </Card>
    </main>
  );
}

function LinkedInContextManager() {
  const utils = api.useUtils();
  const { data, isLoading } = api.userProfile.getContext.useQuery();
  const [value, setValue] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Initialize local state from server once
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
      {/* New token warning */}
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

      {/* Existing tokens */}
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

      {/* Generate new token */}
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
      {/* Existing keys */}
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

      {/* Add/update key */}
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
