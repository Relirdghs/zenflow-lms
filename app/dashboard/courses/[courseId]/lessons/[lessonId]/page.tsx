import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CoursePlayer } from "./course-player";

export default async function LessonPage({
  params,
}: {
  params: Promise<{ courseId: string; lessonId: string }>;
}) {
  const { courseId, lessonId } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();
  if (!enrollment) notFound();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("id, title, order_index, duration_minutes")
    .eq("id", lessonId)
    .eq("course_id", courseId)
    .single();
  if (!lesson) notFound();

  const { data: blocks } = await supabase
    .from("lesson_blocks")
    .select("id, type, content, order_index")
    .eq("lesson_id", lessonId)
    .order("order_index");

  const { data: allLessons } = await supabase
    .from("lessons")
    .select("id, title, order_index")
    .eq("course_id", courseId)
    .order("order_index");

  return (
    <CoursePlayer
      courseId={courseId}
      lessonId={lessonId}
      lessonTitle={lesson.title}
      blocks={blocks ?? []}
      allLessons={allLessons ?? []}
      enrollmentId={enrollment.id}
    />
  );
}
