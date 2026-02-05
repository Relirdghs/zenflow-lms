import { Suspense } from "react";
import nextDynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
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
const PromoBanner = nextDynamic(() => import("@/components/promotions/promo-banner").then(m => ({ default: m.PromoBanner })), {
  loading: () => <Skeleton className="h-32 w-full" />,
});

const InfoSlider = nextDynamic(() => import("@/components/promotions/info-slider").then(m => ({ default: m.InfoSlider })), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

const LiveSearch = nextDynamic(() => import("@/components/search/live-search").then(m => ({ default: m.LiveSearch })), {
  loading: () => <Skeleton className="h-10 w-full" />,
});

const TestimonialsSection = nextDynamic(() => import("@/components/home/testimonials-section").then(m => ({ default: m.TestimonialsSection })), {
  loading: () => <Skeleton className="h-64 w-full" />,
});

const HAS_SUPABASE =
  typeof process !== "undefined" &&
  Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function PopularCourses({ userId, skipDb }: { userId?: string; skipDb?: boolean }) {
  if (skipDb || !HAS_SUPABASE) return null;
  try {
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
      {courses.map((course: { id: string; title: string | null; cover_image: string | null; level: string; average_rating?: number | null; review_count?: number | null }) => (
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
  } catch {
    return null;
  }
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
  let user: { id: string } | null = null;
  let panelHref = "/dashboard";
  let coursesHref = "/dashboard/courses";

  if (HAS_SUPABASE) {
    try {
      const supabase = await createClient();
      const { data: { user: u } } = await supabase.auth.getUser();
      user = u ?? null;

      if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
        try {
          const role = await getRoleForRedirect(user.id, (user as { email?: string }).email, (user as { user_metadata?: Record<string, unknown> }).user_metadata);
          if (role === "super_admin") {
            panelHref = "/admin/super";
            coursesHref = "/admin/courses";
          } else if (role === "admin") {
            panelHref = "/admin";
            coursesHref = "/admin/courses";
          }
        } catch {
          // use default hrefs
        }
      }
    } catch {
      // Supabase or auth failed — render page with defaults
    }
  }

  return (
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-muted/30 via-background to-muted/20">
      <div className="container max-w-6xl mx-auto px-4 sm:px-6 md:px-8 space-y-16 sm:space-y-20 md:space-y-24 pb-16">
        <HeroSection user={user} coursesHref={coursesHref} />

        <PromoBanner />

        <InfoSlider />

        <section className="scroll-mt-20">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-6 text-center text-foreground">
            Найти курс
          </h2>
          <LiveSearch placeholder="Поиск курсов по названию..." />
        </section>

        <BenefitsSection />

        <section className="scroll-mt-20">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-8 text-center text-foreground">
            Популярные курсы
          </h2>
          <Suspense fallback={<PopularCoursesSkeleton />}>
            <PopularCourses userId={user?.id} skipDb={!HAS_SUPABASE} />
          </Suspense>
        </section>

        <TestimonialsSection />

        <WhyAlmatySection />

        <FinalCTASection user={user} />
      </div>
    </div>
  );
}
