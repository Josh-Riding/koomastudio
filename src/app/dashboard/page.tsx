"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { redirect, useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Library, Search, CheckSquare, X, Repeat2 } from "lucide-react";
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
  const router = useRouter();
  const [selectionMode, setSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  function toggleSelection(id: string) {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
    );
  }

  function toggleSelectAll() {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map((p) => p.id));
    }
  }

  function exitSelectionMode() {
    setSelectionMode(false);
    setSelectedIds([]);
  }

  function remixSelected() {
    if (selectedIds.length === 0) return;
    router.push(`/remix?postIds=${selectedIds.join(",")}`);
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold">Your Library</h1>
        <div className="flex items-center gap-2">
          {!selectionMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => setSelectionMode(true)}
              >
                <CheckSquare className="mr-1 h-4 w-4" />
                Select
              </Button>
              <SavePostForm />
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={toggleSelectAll}>
                {selectedIds.length === filtered.length ? "Deselect All" : "Select All"}
              </Button>
              <Button
                size="sm"
                onClick={remixSelected}
                disabled={selectedIds.length === 0}
              >
                <Repeat2 className="mr-1 h-4 w-4" />
                Remix{selectedIds.length > 0 ? ` (${selectedIds.length})` : ""}
              </Button>
              <Button variant="ghost" size="sm" onClick={exitSelectionMode}>
                <X className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
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
            <PostCard
              key={savedPost.id}
              savedPost={savedPost}
              selectionMode={selectionMode}
              selected={selectedIds.includes(savedPost.id)}
              onToggle={toggleSelection}
            />
          ))}
        </div>
      )}
    </main>
  );
}
