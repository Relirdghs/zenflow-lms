import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { GroupForm } from "../group-form";

export default async function NewGroupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Новая группа</h1>
      <GroupForm adminId={user.id} />
    </div>
  );
}
