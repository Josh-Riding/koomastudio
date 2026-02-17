"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Copy, Trash2, Sparkles, Check } from "lucide-react";
import { api } from "@/trpc/react";

export default function RemixesPage() {
  const { data: session, status } = useSession();
  const [statusFilter, setStatusFilter] = useState<
    "draft" | "published" | undefined
  >();
  const [copiedId, setCopiedId] = useState<string | null>(null);

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
    <RemixesList
      statusFilter={statusFilter}
      setStatusFilter={setStatusFilter}
      copiedId={copiedId}
      setCopiedId={setCopiedId}
    />
  );
}

function RemixesList({
  statusFilter,
  setStatusFilter,
  copiedId,
  setCopiedId,
}: {
  statusFilter: "draft" | "published" | undefined;
  setStatusFilter: (s: "draft" | "published" | undefined) => void;
  copiedId: string | null;
  setCopiedId: (id: string | null) => void;
}) {
  const { data: remixes, isLoading } = api.remixes.getAll.useQuery(
    statusFilter ? { status: statusFilter } : undefined,
  );

  const utils = api.useUtils();
  const deleteMutation = api.remixes.delete.useMutation({
    onSuccess: () => void utils.remixes.getAll.invalidate(),
  });
  const updateMutation = api.remixes.update.useMutation({
    onSuccess: () => void utils.remixes.getAll.invalidate(),
  });

  async function handleCopy(id: string, content: string) {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">My Remixes</h1>
        <Button asChild>
          <Link href="/remix">New Remix</Link>
        </Button>
      </div>

      <Tabs
        defaultValue="all"
        onValueChange={(v) =>
          setStatusFilter(
            v === "all" ? undefined : (v as "draft" | "published"),
          )
        }
        className="mb-6"
      >
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
          <TabsTrigger value="published">Published</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading && (
        <p className="text-center text-muted-foreground">Loading remixes...</p>
      )}

      {!isLoading && remixes?.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Sparkles className="h-12 w-12 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">No remixes yet</h2>
            <p className="text-sm text-muted-foreground">
              Create your first remix from saved posts.
            </p>
          </div>
        </div>
      )}

      <div className="space-y-4">
        {remixes?.map((remix) => (
          <Card key={remix.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge
                    variant={
                      remix.status === "published" ? "default" : "secondary"
                    }
                  >
                    {remix.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {remix.aiProvider}
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {new Date(remix.createdAt).toLocaleDateString()}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm">
                {remix.content.length > 300
                  ? remix.content.slice(0, 300) + "..."
                  : remix.content}
              </p>
              {remix.sources.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Inspired by {remix.sources.length} post
                  {remix.sources.length > 1 ? "s" : ""}
                </p>
              )}
            </CardContent>
            <CardFooter className="gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => void handleCopy(remix.id, remix.content)}
              >
                {copiedId === remix.id ? (
                  <Check className="mr-1 h-3 w-3" />
                ) : (
                  <Copy className="mr-1 h-3 w-3" />
                )}
                Copy
              </Button>
              {remix.status === "draft" && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    updateMutation.mutate({
                      id: remix.id,
                      status: "published",
                    })
                  }
                >
                  Mark Published
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => deleteMutation.mutate({ id: remix.id })}
              >
                <Trash2 className="mr-1 h-3 w-3" />
                Delete
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/remixes/${remix.id}`}>View</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </main>
  );
}
