import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { courseLevelLabel } from "@/lib/course-level";
import { ChevronRight, Clock } from "lucide-react";

export default async function CoursePage({
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
    .select("id, title, description, cover_image, level")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id, progress_percent")
    .eq("user_id", user.id)
    .eq("course_id", courseId)
    .single();

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, order_index, duration_minutes")
    .eq("course_id", courseId)
    .order("order_index");

  const isEnrolled = !!enrollment;

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">{course.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{course.description}</p>
          <Badge variant="secondary" className="mt-2">
            {courseLevelLabel(course.level)}
          </Badge>
        </div>
        {!isEnrolled && (
          <Button asChild className="w-full sm:w-auto shrink-0 min-h-[44px] sm:min-h-0">
            <Link href={`/dashboard/courses/${courseId}/enroll`}>Записаться</Link>
          </Button>
        )}
      </div>

      {isEnrolled && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Ваш прогресс</span>
              <span className="text-sm text-muted-foreground">
                {Math.round(Number(enrollment?.progress_percent ?? 0))}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all"
                style={{
                  width: `${enrollment?.progress_percent ?? 0}%`,
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Уроки</h2>
        <ul className="space-y-2">
          {(lessons ?? []).map((lesson, i) => (
            <li key={lesson.id}>
              <Link
                href={
                  isEnrolled
                    ? `/dashboard/courses/${courseId}/lessons/${lesson.id}`
                    : `/dashboard/courses/${courseId}/enroll`
                }
                className="flex items-center gap-3 sm:gap-4 rounded-lg border p-3 sm:p-4 hover:bg-muted/50 transition-colors min-h-[60px]"
              >
                <span className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">{lesson.title}</p>
                  <p className="text-xs sm:text-sm text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.duration_minutes} мин
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </Link>
            </li>
          ))}
        </ul>
        {(!lessons || lessons.length === 0) && (
          <p className="text-muted-foreground">Уроков пока нет.</p>
        )}
      </section>
    </div>
  );
}
