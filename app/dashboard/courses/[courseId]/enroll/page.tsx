import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import EnrollForm from "./enroll-form";

export default async function EnrollPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const { courseId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: course } = await supabase
    .from("courses")
    .select("id, title")
    .eq("id", courseId)
    .single();

  const { data: existing } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  if (existing) redirect(`/dashboard/courses/${courseId}`);
  if (!course) redirect("/dashboard/courses");

  return (
    <div className="max-w-md mx-auto space-y-6">
      <h1 className="text-2xl font-semibold">Запись на курс: {course.title}</h1>
      <EnrollForm courseId={courseId} userId={user.id} />
    </div>
  );
}
