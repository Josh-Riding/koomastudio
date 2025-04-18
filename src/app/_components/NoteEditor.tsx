"use client";
import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";

export default function NoteEditor({ id }: { id: number }) {
  const router = useRouter();
  const utils = api.useUtils();
  const { data: note, isLoading } = api.notes.getById.useQuery(
    { id },
    { enabled: !!id },
  );

  const [draftName, setDraftName] = useState("");
  const [draft, setDraft] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (note) {
      setDraftName(note.draft_name ?? "");
      setDraft(note.draft ?? "");
    }
  }, [note]);

  const handlePost = async () => {
    try {
      await editMutation.mutateAsync({ id, draft_name: draftName, draft });
    } catch (err) {
      console.error("Failed to handle saving while posting", err);
    }
  };

  const editMutation = api.notes.edit.useMutation({
    onSuccess: () => {
      void utils.notes.getAll.invalidate();
      router.push("/notes");
    },
  });

  const deleteMutation = api.notes.deleteById.useMutation({
    onSuccess: () => {
      void utils.notes.getAll.invalidate();
      router.push("/notes");
    },
  });

  const handleSave = async () => {
    try {
      await editMutation.mutateAsync({ id, draft_name: draftName, draft });
    } catch (error) {
      console.error("Failed to save", error);
    }
  };

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync({ id });
    } catch (error) {
      console.error("Failed to delete", error);
    }
  };

  const handleDeleteConfirm = async () => {
    setConfirming(false);
    await handleDelete();
  };

  const handlePostClick = () => {
    setShowModal(true);
  };

  const handleModalClick = () => {
    setShowModal(false);
    navigator.clipboard
      .writeText(draft)
      .then(() => {
        window.open("https://www.linkedin.com/feed/", "_blank");
      })
      .catch((err) => {
        console.error("Failed to copy to clipboard", err);
      });
    void handlePost();
  };

  if (isLoading) return <p>Loading...</p>;
  if (!note) return <p>Draft not found.</p>;

  return (
    <div className="relative mx-auto max-w-xl p-4">
      <h2 className="mb-4 text-2xl font-semibold">Edit Draft</h2>

      <div className="mb-4 flex justify-end">
        <button onClick={handlePostClick} className="animated-button">
          <svg
            viewBox="0 0 24 24"
            className="arr-2"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
          </svg>
          <span className="text">Post</span>
          <span className="circle"></span>
          <svg
            viewBox="0 0 24 24"
            className="arr-1"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path d="M16.1716 10.9999L10.8076 5.63589L12.2218 4.22168L20 11.9999L12.2218 19.778L10.8076 18.3638L16.1716 12.9999H4V10.9999H16.1716Z"></path>
          </svg>
        </button>
      </div>

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
        rows={draft.split("\n").length || 5}
      />
      <div className="flex gap-4">
        <div className="relative h-10 w-1/2">
          <AnimatePresence mode="wait">
            {!confirming ? (
              <motion.button
                key="delete"
                onClick={() => setConfirming(true)}
                className="h-full w-full rounded-lg bg-red-600 py-2 text-white hover:bg-red-700"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                Delete
              </motion.button>
            ) : (
              <motion.div
                key="confirm"
                className="flex w-full gap-2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <button
                  onClick={() => setConfirming(false)}
                  className="flex-1 rounded-lg bg-gray-500 py-2 text-white hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 rounded-lg bg-red-700 py-2 text-white hover:bg-red-800"
                >
                  Confirm
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleSave}
          className="w-1/2 rounded-lg bg-blue-600 py-2 text-white hover:bg-blue-700"
        >
          Save
        </button>
      </div>

      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
          onClick={() => setShowModal(false)}
        >
          <div
            className="rounded-lg bg-white p-8 text-center shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-3xl font-bold text-purple-600">
              🚨 One More Thing! 🚨
            </h2>
            <p className="mb-4 text-lg">
              Your draft has been saved and copied to your clipboard. <br />{" "}
              Click below and paste it into the editor.
            </p>
            <button
              onClick={handleModalClick}
              className="rounded-lg bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
            >
              Take Me to LinkedIn
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
