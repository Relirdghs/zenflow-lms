import Link from "next/link";
import Image from "next/image";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { courseLevelLabel } from "@/lib/course-level";
import { CourseCard } from "@/components/courses/course-card";

// Lazy loading для поиска
const LiveSearch = dynamic(() => import("@/components/search/live-search").then(m => ({ default: m.LiveSearch })), {
  loading: () => <Skeleton className="h-10 w-full" />,
});

// Кэширование на 30 секунд
export const revalidate = 30;

export default async function DashboardCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  // Параллельная загрузка данных для оптимизации
  const [enrollmentsResult, allCoursesResult] = await Promise.all([
    supabase
      .from("enrollments")
      .select(
        `
        id,
        progress_percent,
        courses (
          id,
          title,
          description,
          cover_image,
          level,
          average_rating,
          review_count
        )
      `
      )
      .eq("user_id", user.id),
    supabase
      .from("courses")
      .select("id, title, description, cover_image, level, average_rating, review_count, location_city")
      .order("title"),
  ]);

  const enrollments = enrollmentsResult.data;
  const allCourses = allCoursesResult.data;

  type CourseInfo = { id: string; title: string; description: string | null; cover_image: string | null; level: string; average_rating?: number; review_count?: number };
  const normalizedEnrollments = (enrollments ?? []).map((e: { id: string; progress_percent: number; courses?: CourseInfo | CourseInfo[] | null }) => {
    const c = e.courses;
    const course = c ? (Array.isArray(c) ? c[0] : c) : null;
    return { id: e.id, progress_percent: e.progress_percent, courses: course };
  });
  const enrolledIds = new Set(normalizedEnrollments.map((e) => e.courses?.id).filter(Boolean) as string[]);
  const available = (allCourses ?? []).filter((c) => !enrolledIds.has(c.id));

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Мои курсы</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Ваши курсы и прогресс</p>
      </div>

      {/* Поиск курсов */}
      <div className="w-full">
        <LiveSearch placeholder="Поиск курсов по названию..." />
      </div>

      {normalizedEnrollments.length > 0 && (
        <section>
          <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Записанные</h2>
          <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {normalizedEnrollments.map((e) => (
                <Card key={e.id} className="overflow-hidden">
                  {e.courses?.cover_image && (
                    <div className="relative h-36 bg-muted">
                      <Image
                        src={e.courses.cover_image}
                        alt={`${e.courses.title || "Обложка курса"} — Курсы йоги в Алматы`}
                        fill
                        className="object-cover"
                        loading="lazy"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{e.courses?.title}</span>
                      <Badge variant="secondary">{courseLevelLabel(e.courses?.level)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {e.courses?.description}
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${e.progress_percent}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(Number(e.progress_percent))}%
                      </span>
                    </div>
                    <Button asChild size="sm" className="mt-3 w-full">
                      <Link href={`/dashboard/courses/${e.courses?.id}`}>
                        Открыть курс
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Доступные курсы</h2>
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {available.map((c) => (
            <CourseCard key={c.id} course={c as any} userId={user.id} />
          ))}
        </div>
        {available.length === 0 && (
          <p className="text-muted-foreground">Нет доступных курсов.</p>
        )}
      </section>
    </div>
  );
}
