import Link from "next/link";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Target, TrendingUp, Calendar } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

// Lazy loading для тяжелых компонентов
const CourseRecommendations = dynamic(() => import("@/components/recommendations/course-recommendations").then(m => ({ default: m.CourseRecommendations })), {
  loading: () => <Skeleton className="h-48 w-full" />,
});

const PromoBanner = dynamic(() => import("@/components/promotions/promo-banner").then(m => ({ default: m.PromoBanner })), {
  loading: () => <Skeleton className="h-32 w-full" />,
});

// Кэширование дашборда на 30 секунд
export const revalidate = 30;

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
      ...(memberships ?? []).map((m: { group_id: string | null }) => m.group_id).filter(Boolean),
      ...(enrollmentGroups ?? []).map((e: { group_id: string | null }) => e.group_id).filter(Boolean),
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

  // Статистика пользователя
  const { count: totalCourses } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id);

  const { count: completedCourses } = await supabase
    .from("enrollments")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .gte("progress_percent", 100);

  const averageProgress = enrollments && enrollments.length > 0
    ? Math.round(
        enrollments.reduce((sum: number, e: { progress_percent?: number | null }) => sum + Number(e.progress_percent || 0), 0) /
        enrollments.length
      )
    : 0;

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Панель управления</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Ваш прогресс и следующие шаги</p>
      </div>

      {/* Промо-блок */}
      <PromoBanner />

      {/* Общий прогресс */}
      {enrollments && enrollments.length > 0 && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-base sm:text-lg">Общий прогресс обучения</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {completedCourses || 0} из {totalCourses || 0} курсов завершено
                </span>
                <span className="text-lg font-bold text-primary">{averageProgress}%</span>
              </div>
              <Progress value={averageProgress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                Средний прогресс по всем курсам
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Статистика */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Всего курсов
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{totalCourses || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Завершено
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{completedCourses || 0}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Средний прогресс
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{averageProgress}%</p>
          </CardContent>
        </Card>
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
            {goals.map((g: { id: string; title: string; deadline?: string | null }) => (
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

      {/* Рекомендации */}
      <Suspense fallback={
        <section>
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Рекомендуем вам</h2>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <Skeleton className="h-36 w-full" />
                <CardContent className="pt-4">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-9 w-full mt-2" />
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      }>
        <CourseRecommendations userId={user.id} />
      </Suspense>
    </div>
  );
}
