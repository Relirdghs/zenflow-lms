import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CourseForm } from "../../course-form";
import { getUserRole } from "@/lib/auth/get-user-role";

export default async function EditCoursePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: course } = await supabase
    .from("courses")
    .select("id, title, description, level, created_by, cover_image, is_public")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = getUserRole(profile?.role ?? null, user);
  const isSuperAdmin = role === "super_admin";
  if (course.created_by !== user.id && !isSuperAdmin) notFound();

  const groupsQuery = supabase
    .from("groups")
    .select("id, name, admin_id")
    .order("name");
  if (!isSuperAdmin) {
    groupsQuery.eq("admin_id", user.id);
  }
  const { data: groups } = await groupsQuery;

  const { data: courseGroups } = await supabase
    .from("course_groups")
    .select("group_id")
    .eq("course_id", courseId);
  const defaultGroupIds = courseGroups?.map((g: { group_id: string }) => g.group_id) ?? [];

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Редактирование курса</h1>
      <CourseForm
        createdBy={course.created_by ?? user.id}
        courseId={courseId}
        defaultTitle={course.title}
        defaultDescription={course.description ?? ""}
        defaultLevel={course.level as "beginner" | "intermediate" | "advanced"}
        defaultCoverImage={course.cover_image ?? ""}
        defaultIsPublic={course.is_public ?? true}
        defaultGroupIds={defaultGroupIds}
        groups={(groups ?? []).map((g: { id: string; name: string }) => ({ id: g.id, name: g.name }))}
      />
    </div>
  );
}
