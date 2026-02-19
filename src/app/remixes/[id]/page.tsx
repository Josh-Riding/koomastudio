"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
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
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Copy, Check, Loader2, Save, ExternalLink } from "lucide-react";
import { api } from "@/trpc/react";

export default function RemixDetailPage() {
  const { data: session, status } = useSession();
  const params = useParams();
  const id = params.id as string;

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

  return <RemixDetail id={id} />;
}

function RemixDetail({ id }: { id: string }) {
  const { data: remix, isLoading } = api.remixes.getById.useQuery({ id });
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [copied, setCopied] = useState(false);

  const utils = api.useUtils();
  const updateMutation = api.remixes.update.useMutation({
    onSuccess: () => {
      void utils.remixes.getById.invalidate({ id });
      setEditing(false);
    },
  });

  if (isLoading) {
    return (
      <main className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </main>
    );
  }

  if (!remix) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8">
        <p className="text-muted-foreground">Remix not found.</p>
      </main>
    );
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(remix!.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/remixes">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Back to Remixes
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <Badge variant={remix.status === "published" ? "default" : "secondary"}>
          {remix.status}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {remix.aiProvider} &middot;{" "}
          {new Date(remix.createdAt).toLocaleDateString()}
        </span>
      </div>

      {/* Content */}
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-base">Remix Content</CardTitle>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" onClick={() => void handleCopy()}>
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            {!editing && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setEditContent(remix.content);
                  setEditing(true);
                }}
              >
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {editing ? (
            <div className="space-y-3">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={10}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() =>
                    updateMutation.mutate({ id, content: editContent })
                  }
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending && (
                    <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                  )}
                  <Save className="mr-1 h-3 w-3" />
                  Save
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="whitespace-pre-wrap text-sm">{remix.content}</p>
          )}
        </CardContent>
      </Card>

      {/* Prompt used */}
      {remix.promptUsed && (
        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Prompt Used</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {remix.promptUsed}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Source posts */}
      {remix.sources.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Source Posts</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {remix.sources.map((source) => (
              <div key={source.postId} className="rounded-lg border p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  {source.post.authorName && (
                    <p className="text-xs font-medium">
                      {source.post.authorName}
                    </p>
                  )}
                  {source.post.postUrl && (
                    <a
                      href={source.post.postUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-foreground"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {source.post.content}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </main>
  );
}
