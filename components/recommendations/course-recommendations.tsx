import { getRecommendations } from "@/app/actions/get-recommendations";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { courseLevelLabel } from "@/lib/course-level";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Suspense } from "react";

async function RecommendationsList({ userId }: { userId: string }) {
  // Добавляем revalidate для кэширования рекомендаций
  const recommendations = await getRecommendations(userId, 4);

  if (recommendations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">Пока нет рекомендаций. Просмотрите курсы йоги в Алматы, чтобы получить персональные рекомендации.</p>
    );
  }

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {recommendations.map((course) => (
        <Card key={course.id} className="overflow-hidden">
          {course.cover_image && (
            <div className="relative h-36 bg-muted">
              <Image
                src={course.cover_image}
                alt={`${course.title || "Обложка курса"} — Курсы йоги в Алматы`}
                fill
                className="object-cover"
                loading="lazy"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          )}
          <CardHeader>
            <div className="flex items-center justify-between">
              <span className="font-medium text-sm line-clamp-1">{course.title}</span>
              <Badge variant="secondary" className="text-xs shrink-0">
                {courseLevelLabel(course.level)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            {course.average_rating && course.average_rating > 0 && (
              <div className="mb-2 text-xs text-muted-foreground">
                ⭐ {course.average_rating.toFixed(1)} ({course.review_count || 0})
              </div>
            )}
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href={`/dashboard/courses/${course.id}`}>Посмотреть</Link>
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function RecommendationsSkeleton() {
  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <Skeleton className="h-36 w-full" />
          <CardHeader>
            <Skeleton className="h-4 w-3/4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export function CourseRecommendations({ userId }: { userId: string }) {
  return (
    <section>
      <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Рекомендуем вам курсы йоги в Алматы</h2>
      <Suspense fallback={<RecommendationsSkeleton />}>
        <RecommendationsList userId={userId} />
      </Suspense>
    </section>
  );
}
