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
    <div className="h-[calc(100dvh-6rem)] sm:h-[calc(100dvh-8rem)] flex flex-col min-h-0">
      <h1 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-4 shrink-0">Чат</h1>
      <div className="flex-1 min-h-0 overflow-hidden">
        <ChatPanel userId={user.id} role={role} />
      </div>
    </div>
  );
}
