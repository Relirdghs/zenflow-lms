import { createClient } from "@/lib/supabase/server";
import { ChatPanel } from "./chat-panel";
import { getUserRole } from "@/lib/auth/get-user-role";

export default async function ChatPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = getUserRole(profile?.role ?? null, user);

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col">
      <h1 className="text-2xl font-semibold mb-4">Чат</h1>
      <ChatPanel userId={user.id} role={role} />
    </div>
  );
}
