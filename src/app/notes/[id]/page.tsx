"use client";
import NoteEditor from "@/app/_components/NoteEditor";
import { useParams } from "next/navigation";
import { useSession, SessionProvider } from "next-auth/react";
import { redirect } from "next/navigation";

export default function EditNote() {
  const { data: session, status } = useSession();

  if (status === "loading") return null;
  if (!session) redirect("/signin");

  const { id } = useParams();
  const idNum = Number(id);
  return (
    <SessionProvider>
      <div>
        <NoteEditor id={idNum} />
      </div>
    </SessionProvider>
  );
}
