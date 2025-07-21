"use client";
import { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function NoteList() {
  const router = useRouter();
  const { data: notes, isLoading, refetch } = api.notes.getAll.useQuery();
  const archiveNote = api.notes.archive.useMutation({
    onSuccess: () => refetch(),
  });
  const [activeTab, setActiveTab] = useState<"active" | "archived">("active");
  const [openNote, setOpenNote] = useState<number | null>(null);
  const [swipedNote, setSwipedNote] = useState<number | null>(null);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => setIsMobile(window.innerWidth < 768);
    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  if (isLoading)
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-6">
        <h2 className="text-3xl font-bold text-indigo-700">Your Drafts</h2>
        {[...Array(3).keys()].map((i) => (
          <div
            key={i}
            className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-lg transition-shadow"
          >
            <div className="h-6 w-1/2 animate-pulse rounded bg-indigo-100" />
          </div>
        ))}
      </div>
    );

  const filteredNotes = notes?.filter((note) =>
    activeTab === "active" ? !note.archive : note.archive,
  );

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h2 className="text-3xl font-bold text-indigo-700">Your Drafts</h2>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("active")}
          className={`flex-1 py-2 text-center text-lg font-medium ${
            activeTab === "active"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-indigo-600"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setActiveTab("archived")}
          className={`flex-1 py-2 text-center text-lg font-medium ${
            activeTab === "archived"
              ? "border-b-2 border-indigo-600 text-indigo-600"
              : "text-gray-500 hover:text-indigo-600"
          }`}
        >
          Archived
        </button>
      </div>

      {/* Notes List */}
      {filteredNotes?.length === 0 ? (
        <p className="text-gray-500">
          {activeTab === "active"
            ? "No drafts yet. Click below to create one."
            : "No archived notes."}
        </p>
      ) : (
        <ul className="space-y-4">
          {filteredNotes?.map((note) => (
            <li
              key={note.id}
              onTouchStart={
                isMobile
                  ? (e: React.TouchEvent<HTMLLIElement>) => {
                      const touch = e.touches.item(0);
                      if (touch) {
                        setTouchStartX(touch.clientX);
                      }
                    }
                  : undefined
              }
              onTouchEnd={
                isMobile
                  ? (e: React.TouchEvent<HTMLLIElement>) => {
                      const touch = e.changedTouches.item(0);
                      if (touch && touchStartX !== null) {
                        const deltaX = touch.clientX - touchStartX;
                        if (deltaX < -50) setSwipedNote(note.id);
                      }
                    }
                  : undefined
              }
              className={`relative rounded-xl border-2 border-gray-200 bg-white p-5 shadow-lg transition-shadow hover:shadow-xl ${
                activeTab === "archived" ? "opacity-70" : ""
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <button
                  onClick={() =>
                    setOpenNote(openNote === note.id ? null : note.id)
                  }
                  className="text-left text-xl font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
                >
                  Subject: {note.draft_name}
                </button>

                {/* Desktop Archive Button */}
                {!isMobile && activeTab === "active" && (
                  <button
                    onClick={() => archiveNote.mutate({ id: note.id })}
                    className="mt-2 inline-block rounded bg-gray-100 px-4 py-1 text-sm text-gray-700 hover:bg-gray-200 md:mt-0"
                  >
                    Archive
                  </button>
                )}
              </div>

              {openNote === note.id && (
                <div className="mt-4">
                  <p className="whitespace-pre-line text-gray-800">
                    {note.draft}
                  </p>
                  <button
                    onClick={() => router.push(`/notes/${note.id}`)}
                    className="mt-3 text-indigo-500 underline hover:text-indigo-700"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Mobile Swipe Confirm */}
              {isMobile && swipedNote === note.id && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-xl bg-indigo-100 bg-opacity-90">
                  <button
                    onClick={() => {
                      archiveNote.mutate({ id: note.id });
                      setSwipedNote(null);
                    }}
                    className="rounded bg-indigo-600 px-6 py-2 text-white shadow hover:bg-indigo-700"
                  >
                    Confirm Archive
                  </button>
                  <button
                    onClick={() => setSwipedNote(null)}
                    className="ml-4 rounded border border-gray-400 bg-white px-6 py-2 text-gray-700 shadow hover:bg-gray-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {activeTab === "active" && (
        <button
          onClick={() => router.push("/notes/new")}
          className="block w-full rounded-lg bg-indigo-600 py-3 text-center text-lg font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Create New Draft
        </button>
      )}
    </div>
  );
}
