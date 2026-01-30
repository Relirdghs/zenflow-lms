import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ChevronLeft, Plus, GripVertical, Clock } from "lucide-react";
import { getUserRole } from "@/lib/auth/get-user-role";

export default async function AdminLessonsPage({
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
    .select("id, title, created_by")
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

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id, title, order_index, duration_minutes")
    .eq("course_id", courseId)
    .order("order_index");

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center gap-2 sm:gap-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0 min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0">
          <Link href="/admin/courses">
            <ChevronLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="min-w-0">
          <h1 className="text-lg sm:text-2xl font-semibold truncate">{course.title}</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Уроки</p>
        </div>
      </div>
      <div className="flex justify-end">
        <Button asChild className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
          <Link href={`/admin/courses/${courseId}/lessons/new`}>
            <Plus className="mr-2 h-4 w-4" />
            Новый урок
          </Link>
        </Button>
      </div>
      <ul className="space-y-2">
        {(lessons ?? []).map((lesson, i) => (
          <li key={lesson.id}>
            <Card>
              <CardContent className="py-3 px-3 sm:px-4 flex items-center gap-2 sm:gap-3">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0 hidden sm:block" />
                <span className="text-xs sm:text-sm font-medium text-muted-foreground w-5 sm:w-6 shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm sm:text-base truncate">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {lesson.duration_minutes} мин
                  </p>
                </div>
                <Button asChild size="sm" variant="outline" className="shrink-0 min-h-[40px] sm:min-h-0 text-xs sm:text-sm px-2 sm:px-3">
                  <Link href={`/admin/courses/${courseId}/lessons/${lesson.id}/builder`}>
                    <span className="hidden sm:inline">Конструктор</span>
                    <span className="sm:hidden">Ред.</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </li>
        ))}
      </ul>
      {(!lessons || lessons.length === 0) && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Нет уроков.</p>
            <Button asChild>
              <Link href={`/admin/courses/${courseId}/lessons/new`}>
                Добавить первый урок
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
