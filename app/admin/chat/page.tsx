import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ChatPanel } from "@/app/dashboard/chat/chat-panel";
import { getUserRole } from "@/lib/auth/get-user-role";

export default async function AdminChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = getUserRole(profile?.role ?? null, user);
  if (role !== "admin" && role !== "super_admin") {
    redirect("/dashboard");
  }

  return <ChatPanel userId={user.id} role={role} />;
}
