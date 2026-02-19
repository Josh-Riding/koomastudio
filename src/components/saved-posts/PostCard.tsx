"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { ExternalLink, Repeat2, Trash2 } from "lucide-react";
import { api } from "@/trpc/react";
import Link from "next/link";

interface PostCardProps {
  selectionMode?: boolean;
  selected?: boolean;
  onToggle?: (id: string) => void;
  savedPost: {
    id: string;
    tags: string[] | null;
    notes: string | null;
    createdAt: Date;
    post: {
      content: string;
      authorName: string | null;
      postUrl: string | null;
      embedUrl: string | null;
      mediaType: string | null;
      ogImage: string | null;
    };
    collections: {
      collection: { id: string; name: string };
    }[];
  };
}

export default function PostCard({ savedPost, selectionMode, selected, onToggle }: PostCardProps) {
  const utils = api.useUtils();
  const unsaveMutation = api.savedPosts.unsave.useMutation({
    onSuccess: () => void utils.savedPosts.getAll.invalidate(),
  });

  const { post } = savedPost;

  return (
    <Card
      className={`overflow-hidden transition-colors ${selectionMode ? "cursor-pointer" : ""} ${selected ? "ring-2 ring-primary" : ""}`}
      onClick={selectionMode ? () => onToggle?.(savedPost.id) : undefined}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {post.authorName && (
              <p className="text-sm font-medium">{post.authorName}</p>
            )}
            {post.mediaType && (
              <Badge variant="outline" className="text-xs">
                {post.mediaType}
              </Badge>
            )}
            {savedPost.tags?.map((tag) => (
              <Badge key={tag} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
          {selectionMode ? (
            <Checkbox
              checked={selected}
              onCheckedChange={() => onToggle?.(savedPost.id)}
              onClick={(e) => e.stopPropagation()}
              className="mt-0.5 shrink-0"
            />
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {new Date(savedPost.createdAt).toLocaleDateString()}
              </span>
              {post.postUrl && (
                <a
                  href={post.postUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        {/* Show embed iframe if available, otherwise text */}
        {post.embedUrl ? (
          <div className="overflow-hidden rounded-md border">
            <iframe
              src={post.embedUrl}
              className="w-full"
              height="400"
              frameBorder="0"
              allowFullScreen
              title={`Post by ${post.authorName ?? "unknown"}`}
              loading="lazy"
            />
          </div>
        ) : (
          <p className="whitespace-pre-wrap text-sm">
            {post.content.length > 200
              ? post.content.slice(0, 200) + "..."
              : post.content}
          </p>
        )}
        {savedPost.notes && (
          <p className="mt-2 text-xs italic text-muted-foreground">
            {savedPost.notes}
          </p>
        )}
      </CardContent>
      {!selectionMode && (
        <CardFooter className="gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href={`/remix?postId=${savedPost.id}`}>
              <Repeat2 className="mr-1 h-3 w-3" />
              Remix
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => unsaveMutation.mutate({ id: savedPost.id })}
            disabled={unsaveMutation.isPending}
          >
            <Trash2 className="mr-1 h-3 w-3" />
            Remove
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}
