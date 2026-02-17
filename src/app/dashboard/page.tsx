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

  return <DashboardContent search={search} setSearch={setSearch} />;
}

function DashboardContent({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (s: string) => void;
}) {
  const { data: savedPosts, isLoading } = api.savedPosts.getAll.useQuery(
    search ? { search } : undefined,
  );

  return (
    <main className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Your Library</h1>
        <SavePostForm />
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search saved posts..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {isLoading && (
        <p className="text-center text-muted-foreground">Loading posts...</p>
      )}

      {!isLoading && savedPosts?.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <Library className="h-12 w-12 text-muted-foreground" />
          <div>
            <h2 className="text-lg font-semibold">No saved posts yet</h2>
            <p className="text-sm text-muted-foreground">
              Save your first LinkedIn post to start building your library.
            </p>
          </div>
        </div>
      )}

      {savedPosts && savedPosts.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {savedPosts.map((savedPost) => (
            <PostCard key={savedPost.id} savedPost={savedPost} />
          ))}
        </div>
      )}
    </main>
  );
}
