import { Suspense } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { getRoleForRedirect } from "@/lib/auth/role-for-middleware";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { courseLevelLabel } from "@/lib/course-level";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { HeroSection } from "@/components/home/hero-section";
import { BenefitsSection } from "@/components/home/benefits-section";
import { WhyAlmatySection } from "@/components/home/why-almaty-section";
import { FinalCTASection } from "@/components/home/final-cta-section";

// Lazy loading для тяжелых компонентов
const PromoBanner = dynamic(() => import("@/components/promotions/promo-banner").then(m => ({ default: m.PromoBanner })), {
  loading: () => <Skeleton className="h-32 w-full" />,
});

const InfoSlider = dynamic(() => import("@/components/promotions/info-slider").then(m => ({ default: m.InfoSlider })), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

const LiveSearch = dynamic(() => import("@/components/search/live-search").then(m => ({ default: m.LiveSearch })), {
  loading: () => <Skeleton className="h-10 w-full" />,
});

const TestimonialsSection = dynamic(() => import("@/components/home/testimonials-section").then(m => ({ default: m.TestimonialsSection })), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

async function PopularCourses({ userId }: { userId?: string }) {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, description, cover_image, level, average_rating, review_count, is_featured")
    .eq("is_featured", true)
    .order("average_rating", { ascending: false, nullsFirst: false })
    .limit(6);

  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          {course.cover_image && (
            <div className="relative h-48 bg-muted">
              <Image
                src={course.cover_image}
                alt={`${course.title || "Обложка курса"} — Курсы йоги в Алматы`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          )}
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm sm:text-base line-clamp-1">{course.title}</span>
              <Badge variant="secondary" className="text-xs shrink-0">
                {courseLevelLabel(course.level)}
              </Badge>
            </div>
            {course.average_rating && course.average_rating > 0 && (
              <div className="text-xs text-muted-foreground mb-3">
                ⭐ {course.average_rating.toFixed(1)} ({course.review_count || 0} отзывов)
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 mt-4">
              {userId ? (
                <>
                  <Button asChild size="sm" className="flex-1 min-h-[44px] sm:min-h-0">
                    <Link href={`/dashboard/courses/${course.id}/enroll`}>Записаться</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="min-h-[44px] sm:min-h-0">
                    <Link href={`/dashboard/courses/${course.id}`}>Подробнее</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild size="sm" className="flex-1 min-h-[44px] sm:min-h-0">
                    <Link href="/signup">Записаться</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="min-h-[44px] sm:min-h-0">
                    <Link href={`/dashboard/courses/${course.id}`}>Подробнее</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PopularCoursesSkeleton() {
  return (
    <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i}>
          <Skeleton className="h-48 w-full" />
          <CardContent className="pt-4">
            <Skeleton className="h-4 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-3" />
            <div className="flex gap-2 mt-4">
              <Skeleton className="h-9 flex-1" />
              <Skeleton className="h-9 w-24" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let panelHref = "/dashboard";
  let coursesHref = "/dashboard/courses";
  if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const role = await getRoleForRedirect(user.id, user.email, user.user_metadata);
    if (role === "super_admin") {
      panelHref = "/admin/super";
      coursesHref = "/admin/courses";
    } else if (role === "admin") {
      panelHref = "/admin";
      coursesHref = "/admin/courses";
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-muted/50 to-background">
      <div className="container mx-auto px-4 sm:px-6 md:px-8 space-y-12 sm:space-y-16 md:space-y-20">
        {/* Hero секция */}
        <HeroSection user={user} coursesHref={coursesHref} />

        {/* Промо-блок */}
        <PromoBanner />

        {/* Информационный слайдер */}
        <InfoSlider />

        {/* Поиск курсов - теперь для всех */}
        <section>
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6 text-center">
            Найти курс
          </h2>
          <LiveSearch placeholder="Поиск курсов по названию..." />
        </section>

        {/* Преимущества платформы */}
        <BenefitsSection />

        {/* Популярные курсы */}
        <section>
          <h2 className="text-2xl sm:text-3xl font-bold mb-6 sm:mb-8 text-center">
            Популярные курсы
          </h2>
          <Suspense fallback={<PopularCoursesSkeleton />}>
            <PopularCourses userId={user?.id} />
          </Suspense>
        </section>

        {/* Отзывы учеников */}
        <TestimonialsSection />

        {/* Почему выбирают нас в Алматы */}
        <WhyAlmatySection />

        {/* Финальный CTA */}
        <FinalCTASection user={user} />
      </div>
    </div>
  );
}
