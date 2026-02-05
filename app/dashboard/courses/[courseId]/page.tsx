import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { courseLevelLabel } from "@/lib/course-level";
import { ChevronRight, Clock } from "lucide-react";
import { FavoriteButton } from "@/components/favorites/favorite-button";
import { ShareButton } from "@/components/share-button";
import { Skeleton } from "@/components/ui/skeleton";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { FloatingEnrollButton } from "@/components/courses/floating-enroll-button";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";

// Lazy loading для тяжелых компонентов
const ReviewList = dynamic(() => import("@/components/reviews/review-list").then(m => ({ default: m.ReviewList })), {
  loading: () => <Skeleton className="h-32 w-full" />,
});

const ReviewForm = dynamic(() => import("@/components/reviews/review-form").then(m => ({ default: m.ReviewForm })), {
  loading: () => <Skeleton className="h-32 w-full" />,
});

const CourseRecommendations = dynamic(() => import("@/components/recommendations/course-recommendations").then(m => ({ default: m.CourseRecommendations })), {
  loading: () => <Skeleton className="h-48 w-full" />,
});

// Кэширование страницы курса на 30 секунд
export const revalidate = 30;

// Generate dynamic metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ courseId: string }>;
}): Promise<Metadata> {
  const { courseId } = await params;
  const supabase = await createClient();

  const { data: course } = await supabase
    .from("courses")
    .select("title, description, cover_image, level, location_city")
    .eq("id", courseId)
    .single();

  if (!course) {
    return {
      title: "Курс не найден",
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zenflow.app";

  const locationCity = course.location_city || "Алматы";
  const titleWithLocation = `${course.title} — Йога в ${locationCity}`;
  const descriptionWithLocation = course.description 
    ? `${course.description} Курс йоги в ${locationCity}. Уровень: ${courseLevelLabel(course.level)}`
    : `Курс йоги "${course.title}" в ${locationCity}. Уровень: ${courseLevelLabel(course.level)}. Онлайн обучение йоге с персональным прогрессом.`;

  return {
    title: titleWithLocation,
    description: descriptionWithLocation,
    keywords: [
      `йога ${locationCity}`,
      `курсы йоги ${locationCity}`,
      course.title,
      courseLevelLabel(course.level),
      "онлайн йога",
    ],
    openGraph: {
      title: titleWithLocation,
      description: descriptionWithLocation,
      type: "article",
      url: `${siteUrl}/dashboard/courses/${courseId}`,
      images: course.cover_image
        ? [{ url: course.cover_image, width: 1200, height: 630, alt: `${course.title} — Йога в ${locationCity}` }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: titleWithLocation,
      description: descriptionWithLocation,
      images: course.cover_image ? [course.cover_image] : undefined,
    },
  };
}

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
    .select("id, title, description, cover_image, level, average_rating, review_count, location_city")
    .eq("id", courseId)
    .single();

  if (!course) notFound();

  // Отслеживание просмотра курса (для рекомендаций) - используем upsert для избежания дублирования
  if (user) {
    try {
      await supabase
        .from("course_views")
        .upsert(
          { user_id: user.id, course_id: courseId, viewed_at: new Date().toISOString() },
          { onConflict: "user_id,course_id" }
        );
    } catch {
      // Игнорируем ошибки
    }
  }

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

  // Calculate total duration
  const totalDuration = (lessons ?? []).reduce((sum: number, l: { duration_minutes?: number | null }) => sum + (l.duration_minutes || 0), 0);

  // Structured data for Course (JSON-LD) с гео-привязкой
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zenflow.app";
  const locationCity = course.location_city || "Алматы";
  const courseSchema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.title,
    description: course.description || `Курс йоги: ${course.title}`,
    provider: {
      "@type": "Organization",
      name: "ZenFlow",
      url: siteUrl,
      address: {
        "@type": "PostalAddress",
        addressLocality: locationCity,
        addressRegion: "Алматинская область",
        addressCountry: "KZ",
      },
    },
    educationalLevel: courseLevelLabel(course.level),
    numberOfLessons: lessons?.length || 0,
    timeRequired: `PT${totalDuration}M`,
    image: course.cover_image || undefined,
    url: `${siteUrl}/dashboard/courses/${courseId}`,
    audience: {
      "@type": "Audience",
      geographicArea: {
        "@type": "City",
        name: locationCity,
      },
    },
    aggregateRating: course.average_rating && course.average_rating > 0 ? {
      "@type": "AggregateRating",
      ratingValue: course.average_rating,
      reviewCount: course.review_count || 0,
      bestRating: 5,
      worstRating: 1,
    } : undefined,
  };

  return (
    <>
      {/* Structured data for Course */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchema) }}
      />
      <div className="space-y-4 sm:space-y-6">
      {/* Хлебные крошки */}
      <Breadcrumbs
        items={[
          { label: "Курсы", href: "/dashboard/courses" },
          { label: `${course.title} (Алматы)` },
        ]}
      />

      {/* Hero секция с cover image */}
      {course.cover_image && (
        <div className="relative h-48 sm:h-64 w-full rounded-lg overflow-hidden bg-muted">
          <Image
            src={course.cover_image}
            alt={`${course.title} — Йога в Алматы`}
            fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, 100vw"
            priority
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold">
            {course.title} — Йога в {course.location_city || "Алматы"}
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">{course.description}</p>
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <Badge variant="secondary">
              {courseLevelLabel(course.level)}
            </Badge>
            {course.location_city && (
              <Badge variant="outline">
                📍 {course.location_city}
              </Badge>
            )}
            {course.average_rating && course.average_rating > 0 && (
              <Badge variant="outline">
                ⭐ {course.average_rating.toFixed(1)} ({course.review_count || 0} отзывов)
              </Badge>
            )}
          </div>
        </div>
        <div className="flex gap-2 shrink-0 flex-wrap">
          {user && <FavoriteButton courseId={courseId} userId={user.id} variant="outline" size="sm" />}
          <ShareButton
            title={course.title}
            text={course.description || undefined}
            url={`${process.env.NEXT_PUBLIC_SITE_URL || ""}/dashboard/courses/${courseId}`}
            variant="outline"
            size="sm"
          />
          {!isEnrolled && (
            <Button asChild className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
              <Link href={`/dashboard/courses/${courseId}/enroll`}>Записаться</Link>
            </Button>
          )}
        </div>
      </div>

      {isEnrolled && enrollment && (
        <Card className="border-primary/20">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold">Ваш прогресс по курсу</span>
              <span className="text-base font-bold text-primary">
                {Math.round(Number(enrollment.progress_percent ?? 0))}%
              </span>
            </div>
            <Progress value={Number(enrollment.progress_percent ?? 0)} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              Продолжайте обучение, чтобы завершить курс
            </p>
          </CardContent>
        </Card>
      )}

      <section>
        <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Уроки</h2>
        <ul className="space-y-2">
          {(lessons ?? []).map((lesson: { id: string; title: string; duration_minutes?: number | null }, i: number) => (
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

      {/* Отзывы */}
      <section>
        <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Отзывы</h2>
        <Suspense fallback={<Skeleton className="h-32 w-full" />}>
          <ReviewList courseId={courseId} />
        </Suspense>
        {user && (
          <Card className="mt-4">
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-4">Оставить отзыв</h3>
              <ReviewForm userId={user.id} courseId={courseId} />
            </CardContent>
          </Card>
        )}
      </section>

      {/* Рекомендации */}
      {user && (
        <section>
          <Suspense fallback={<Skeleton className="h-48 w-full" />}>
            <CourseRecommendations userId={user.id} />
          </Suspense>
        </section>
      )}
      </div>

      {/* Плавающая кнопка "Записаться" на мобильных */}
      {user && <FloatingEnrollButton courseId={courseId} isEnrolled={isEnrolled} />}
    </>
  );
}
