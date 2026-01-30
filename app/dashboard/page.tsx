import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: enrollments } = await supabase
    .from("enrollments")
    .select(
      `
      id,
      progress_percent,
      courses (id, title, cover_image, level)
    `
    )
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .limit(4);

  // Получить группы пользователя (через group_members, fallback на enrollments)
  const { data: memberships } = await supabase
    .from("group_members")
    .select("group_id")
    .eq("user_id", user.id);

  const { data: enrollmentGroups } = await supabase
    .from("enrollments")
    .select("group_id")
    .eq("user_id", user.id)
    .not("group_id", "is", null);

  const groupIds = [
    ...new Set([
      ...(memberships ?? []).map((m) => m.group_id).filter(Boolean),
      ...(enrollmentGroups ?? []).map((e) => e.group_id).filter(Boolean),
    ] as string[]),
  ];

  // Получить цели групп
  const { data: goals } = groupIds.length > 0
    ? await supabase
        .from("goals")
        .select("id, title, is_completed, deadline")
        .in("group_id", groupIds)
        .eq("is_completed", false)
        .limit(3)
    : { data: null };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Панель управления</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Ваш прогресс и следующие шаги</p>
      </div>

      <section>
        <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Продолжить обучение</h2>
        {enrollments && enrollments.length > 0 ? (
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
            {((enrollments ?? []) as { id: string; progress_percent: number; courses: { id: string; title: string; cover_image: string | null; level: string } | { id: string; title: string; cover_image: string | null; level: string }[] | null }[]).map((e) => {
              const c = e.courses;
              const course = c ? (Array.isArray(c) ? c[0] : c) : null;
              return { ...e, courses: course };
            }).map(
              (e) => (
                <Card key={e.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center gap-2">
                      <BookOpen className="h-4 w-4" />
                      {e.courses?.title ?? "Курс"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Progress value={Number(e.progress_percent)} className="mb-2" />
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/dashboard/courses/${e.courses?.id}`}>
                        Продолжить
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">
                Вы пока не записаны ни на один курс.
              </p>
              <Button asChild>
                <Link href="/dashboard/courses">Посмотреть курсы</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>

      <section>
        <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Активные цели</h2>
        {goals && goals.length > 0 ? (
          <ul className="space-y-2">
            {goals.map((g) => (
              <li key={g.id}>
                <Link
                  href="/dashboard/goals"
                  className="flex items-center gap-2 rounded-lg border p-3 hover:bg-muted/50"
                >
                  <Target className="h-4 w-4 text-primary" />
                  <span>{g.title}</span>
                  {g.deadline && (
                    <span className="text-muted-foreground text-sm ml-auto">
                      {new Date(g.deadline).toLocaleDateString()}
                    </span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground mb-4">Нет активных целей.</p>
              <Button asChild variant="outline">
                <Link href="/dashboard/goals">Перейти к целям</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </section>
    </div>
  );
}
