"use client";
import { useState } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";

export default function NoteList() {
  const router = useRouter();
  const { data: notes, isLoading } = api.notes.getAll.useQuery();
  const [openNote, setOpenNote] = useState<number | null>(null);

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

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <h2 className="text-3xl font-bold text-indigo-700">Your Drafts</h2>
      {notes?.length === 0 ? (
        <p className="text-gray-500">
          No drafts yet. Click below to create one.
        </p>
      ) : (
        <ul className="space-y-4">
          {notes?.map((note) => (
            <li
              key={note.id}
              className="rounded-xl border-2 border-gray-200 bg-white p-5 shadow-lg transition-shadow hover:shadow-xl"
            >
              <button
                onClick={() =>
                  setOpenNote(openNote === note.id ? null : note.id)
                }
                className="text-xl font-semibold text-indigo-600 hover:text-indigo-700 hover:underline"
              >
                Subject: {note.draft_name}
              </button>
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
            </li>
          ))}
        </ul>
      )}
      <button
        onClick={() => router.push("/notes/new")}
        className="block w-full rounded-lg bg-indigo-600 py-3 text-center text-lg font-medium text-white transition-colors hover:bg-indigo-700"
      >
        Create New Draft
      </button>
    </div>
  );
}
