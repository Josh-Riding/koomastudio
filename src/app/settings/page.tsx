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
import { Key, Trash2, Loader2 } from "lucide-react";
import { api } from "@/trpc/react";

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

      {/* API Keys */}
      <Card>
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
    </main>
  );
}

function ApiKeyManager() {
  const [provider, setProvider] = useState<"anthropic" | "openai">("anthropic");
  const [keyValue, setKeyValue] = useState("");

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
          <div className="flex items-center gap-2">
            <Key className="h-4 w-4 text-muted-foreground" />
            <Badge variant="outline">{k.provider}</Badge>
            <span className="text-sm text-muted-foreground">{k.keyHint}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate({ id: k.id })}
            disabled={deleteMutation.isPending}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
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
        <Button
          onClick={() =>
            upsertMutation.mutate({ provider, key: keyValue })
          }
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
