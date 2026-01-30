import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  return (
    <div className="max-w-md space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Профиль</h1>
        <p className="text-muted-foreground">Обновите данные аккаунта</p>
      </div>
      <ProfileForm
        email={user.email ?? ""}
        fullName={profile?.full_name ?? ""}
        avatarUrl={profile?.avatar_url ?? ""}
      />
    </div>
  );
}
