"use client";

import { useState } from "react";
import NotesChart from "./NotesChart";

type User = {
  id: string;
  name: string | null;
  email: string;
  noteCount: number;
};

type DataPoint = {
  date: string;
  count: number;
};

export default function ClientDashboardToggle({
  users,
  created,
  updated,
}: {
  users: User[];
  created: DataPoint[];
  updated: DataPoint[];
}) {
  const [view, setView] = useState<"users" | "created" | "updated">("users");

  return (
    <div className="space-y-6">
      <div className="flex justify-center gap-4">
        <button
          onClick={() => setView("users")}
          className={`rounded px-4 py-2 ${
            view === "users"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Users
        </button>
        <button
          onClick={() => setView("created")}
          className={`rounded px-4 py-2 ${
            view === "created"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Posts Created
        </button>
        <button
          onClick={() => setView("updated")}
          className={`rounded px-4 py-2 ${
            view === "updated"
              ? "bg-blue-600 text-white"
              : "bg-gray-100 text-gray-700"
          }`}
        >
          Posts Edited
        </button>
      </div>

      {view === "users" && (
        <div className="space-y-2">
          {users.map((user) => (
            <div key={user.id} className="rounded border p-4">
              <p className="font-medium">{user.name}</p>
              <p className="text-sm text-gray-500">{user.email}</p>
              <p className="text-sm text-blue-600">
                {user.noteCount} post{user.noteCount === 1 ? "" : "s"}
              </p>
            </div>
          ))}
        </div>
      )}

      {view === "created" && (
        <div>
          <h2 className="mb-2 text-xl font-semibold">Notes Created Per Day</h2>
          <NotesChart data={created} />
        </div>
      )}

      {view === "updated" && (
        <div>
          <h2 className="mb-2 text-xl font-semibold">Notes Updated Per Day</h2>
          <NotesChart data={updated} />
        </div>
      )}
    </div>
  );
}
