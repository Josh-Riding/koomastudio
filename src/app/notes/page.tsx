import NoteList from "../_components/NoteList";
import { auth } from "@/server/auth";
import { redirect } from "next/navigation";

export default async function Notes() {
  const session = await auth();
  if (!session) redirect("/signin");

  return (
    <div>
      <NoteList />
    </div>
  );
}
