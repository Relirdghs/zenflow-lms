import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { CourseForm } from "../course-form";
import { getUserRole } from "@/lib/auth/get-user-role";

export default async function NewCoursePage() {
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
  const isSuperAdmin = role === "super_admin";
  const groupsQuery = supabase
    .from("groups")
    .select("id, name, admin_id")
    .order("name");
  if (!isSuperAdmin) {
    groupsQuery.eq("admin_id", user.id);
  }
  const { data: groups } = await groupsQuery;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Новый курс</h1>
      <CourseForm createdBy={user.id} groups={(groups ?? []).map((g) => ({ id: g.id, name: g.name }))} />
    </div>
  );
}
