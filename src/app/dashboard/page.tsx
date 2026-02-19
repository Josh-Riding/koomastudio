"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Library, Search } from "lucide-react";
import SavePostForm from "@/components/saved-posts/SavePostForm";
import PostCard from "@/components/saved-posts/PostCard";
import { api } from "@/trpc/react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);

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
    <DashboardContent
      search={search}
      setSearch={setSearch}
      activeTag={activeTag}
      setActiveTag={setActiveTag}
    />
  );
}

function DashboardContent({
  search,
  setSearch,
  activeTag,
  setActiveTag,
}: {
  search: string;
  setSearch: (s: string) => void;
  activeTag: string | null;
  setActiveTag: (t: string | null) => void;
}) {
  const { data: savedPosts, isLoading } = api.savedPosts.getAll.useQuery(
    search ? { search } : undefined,
  );

  // Collect all unique tags + media types across posts
  const allTags = Array.from(
    new Set(savedPosts?.flatMap((p) => p.tags ?? []) ?? []),
  ).sort();

  const allMediaTypes = Array.from(
    new Set(savedPosts?.map((p) => p.post.mediaType).filter(Boolean) ?? []),
  ).sort() as string[];

  const allFilters = [...allMediaTypes, ...allTags];

  const filtered = activeTag
    ? (savedPosts?.filter((p) =>
        p.tags?.includes(activeTag) || p.post.mediaType === activeTag,
      ) ?? [])
    : (savedPosts ?? []);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Your Library</h1>
        <SavePostForm />
      </div>

      {/* Search */}
      <div className="relative mb-3">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search saved posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Tag filters */}
      {allFilters.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {allFilters.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition-colors ${
                activeTag === tag
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:border-primary hover:text-foreground"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}

      {isLoading && (
        <p className="text-center text-muted-foreground">Loading posts...</p>
      )}

      {!isLoading && filtered.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Library className="h-12 w-12 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">
              {activeTag ? `No posts tagged "${activeTag}"` : "No saved posts yet"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {activeTag
                ? "Try a different tag or clear the filter."
                : "Save your first LinkedIn post to start building your library."}
            </p>
          </div>
        </div>
      )}

      {filtered.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((savedPost) => (
            <PostCard key={savedPost.id} savedPost={savedPost} />
          ))}
        </div>
      )}
    </main>
  );
}
