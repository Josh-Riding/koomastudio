"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function NewNoteEditor() {
  const router = useRouter();
  const [draftName, setDraftName] = useState("");
  const [draft, setDraft] = useState("");
  const utils = api.useUtils();
  const createMutation = api.notes.create.useMutation({
    onSuccess: () => {
      utils.notes.getAll.invalidate();
      router.push("/notes");
    },
  });

  const handleSave = () => {
    createMutation.mutate({ draft_name: draftName, draft });
  };

  const handleCancel = () => {
    router.push("/notes");
  };
  return (
    <div className="mx-auto max-w-xl p-4">
      <h2 className="mb-4 text-2xl font-semibold">New Draft</h2>
      <input
        type="text"
        placeholder="Subject"
        value={draftName}
        onChange={(e) => setDraftName(e.target.value)}
        className="mb-2 w-full rounded border p-2"
      />
      <textarea
        placeholder="Write your draft..."
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        className="mb-4 w-full rounded border p-2"
        rows={5}
      />
      <div className="flex gap-4">
        <button
          onClick={handleCancel}
          className="w-1/2 rounded-lg border border-red-600 bg-white py-2 text-red-600 hover:bg-red-100"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="w-1/2 rounded-lg bg-green-600 py-2 text-white hover:bg-green-700"
        >
          Save
        </button>
      </div>
    </div>
  );
}
