import NewNoteEditor from "@/app/_components/NewNoteEditor";
import { redirect } from "next/navigation";
import { auth } from "@/server/auth";

export default async function Puzzles() {
  const session = await auth();
  if (!session) redirect("/signin");

  return (
    <div>
      <NewNoteEditor />
    </div>
  );
}
