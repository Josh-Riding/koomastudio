"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2, X, Check } from "lucide-react";
import { api } from "@/trpc/react";

export default function SavePostForm() {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  const [content, setContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [ogImage, setOgImage] = useState<string | null>(null);
  const [postUrl, setPostUrl] = useState<string | null>(null);
  const [embedUrl, setEmbedUrl] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"photo" | "video" | "carousel" | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [notes, setNotes] = useState("");
  const [manualMode, setManualMode] = useState(false);
  const [extracting, setExtracting] = useState(false);

  const utils = api.useUtils();
  const extractMutation = api.savedPosts.extractFromUrl.useMutation();
  const saveMutation = api.savedPosts.save.useMutation({
    onSuccess: () => {
      void utils.savedPosts.getAll.invalidate();
      resetForm();
      setOpen(false);
    },
  });

  function resetForm() {
    setUrl("");
    setContent("");
    setAuthorName("");
    setOgImage(null);
    setPostUrl(null);
    setEmbedUrl(null);
    setMediaType(null);
    setTags([]);
    setTagInput("");
    setNotes("");
    setManualMode(false);
    setExtracting(false);
  }

  const [extractError, setExtractError] = useState<string | null>(null);

  async function handleExtract() {
    if (!url.trim()) return;
    setExtracting(true);
    setExtractError(null);
    try {
      const result = await extractMutation.mutateAsync({ url: url.trim() });
      if (result.success) {
        setContent(result.data.content);
        setAuthorName(result.data.authorName ?? "");
        setOgImage(result.data.ogImage);
        setPostUrl(result.data.postUrl);
        setEmbedUrl(result.data.embedUrl ?? null);
        setMediaType(result.data.mediaType ?? null);
      } else {
        setPostUrl(url.trim());
        setManualMode(true);
        setExtractError(
          "LinkedIn blocked auto-extraction. Paste the post content below.",
        );
      }
    } catch {
      setPostUrl(url.trim());
      setManualMode(true);
      setExtractError(
        "LinkedIn blocked auto-extraction. Paste the post content below.",
      );
    }
    setExtracting(false);
  }

  function addTag() {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput("");
  }

  function handleSave() {
    if (!content.trim()) return;
    saveMutation.mutate({
      content: content.trim(),
      authorName: authorName.trim() || null,
      authorUrl: null,
      postUrl: postUrl,
      embedUrl: embedUrl,
      mediaType: mediaType,
      ogImage: ogImage,
      tags: tags.length > 0 ? tags : undefined,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Save Post
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] overflow-y-auto overflow-x-hidden sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Save a LinkedIn Post</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* URL / embed extraction */}
          {!content && !manualMode && (
            <div className="space-y-3">
              <div className="rounded-md border border-dashed p-3 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">How to save a post:</p>
                <ol className="mt-1.5 list-inside list-decimal space-y-0.5 text-xs">
                  <li>On the LinkedIn post, click <strong>...</strong> &rarr; <strong>Embed this post</strong></li>
                  <li>Copy the embed code and paste it below</li>
                </ol>
                <p className="mt-1.5 text-xs">
                  You can also paste a post URL, but embed gives the best results.
                </p>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Paste embed code or post URL..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      void handleExtract();
                    }
                  }}
                />
                <Button
                  onClick={() => void handleExtract()}
                  disabled={extracting || !url.trim()}
                >
                  {extracting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Extract"
                  )}
                </Button>
              </div>
              <button
                type="button"
                onClick={() => setManualMode(true)}
                className="text-sm text-muted-foreground underline"
              >
                Or paste content manually
              </button>
            </div>
          )}

          {/* Content form (shown after extraction or manual mode) */}
          {(content || manualMode) && (
            <>
              {extractError && (
                <p className="rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
                  {extractError}
                </p>
              )}
              {postUrl && (
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  URL saved <Check className="h-3 w-3 text-green-600" />
                </p>
              )}
              <div className="space-y-2">
                <label className="text-sm font-medium">Post Content</label>
                <Textarea
                  placeholder="Paste the LinkedIn post content..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={6}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Author Name</label>
                <Input
                  placeholder="Author name"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags</label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                  />
                  <Button variant="outline" onClick={addTag} type="button">
                    Add
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags(tags.filter((t) => t !== tag))}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  placeholder="Your notes about this post..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
              </div>
              <Button
                onClick={handleSave}
                disabled={saveMutation.isPending || !content.trim()}
                className="w-full"
              >
                {saveMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Save Post
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
