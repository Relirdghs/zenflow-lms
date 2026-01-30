import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { LessonForm } from "../lesson-form";

export default async function NewLessonPage({
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
  if (!course) redirect("/admin/courses");

  const { data: lessons } = await supabase
    .from("lessons")
    .select("order_index")
    .eq("course_id", courseId)
    .order("order_index", { ascending: false })
    .limit(1);

  const nextOrder = (lessons?.[0]?.order_index ?? -1) + 1;

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="text-2xl font-semibold">Новый урок — {course.title}</h1>
      <LessonForm courseId={courseId} orderIndex={nextOrder} />
    </div>
  );
}
