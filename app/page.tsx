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
    <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {courses.map((course: { id: string; title: string | null; cover_image: string | null; level: string; average_rating?: number | null; review_count?: number | null }) => (
        <Card 
          key={course.id} 
          className="group overflow-hidden border-2 border-border/50 hover:border-primary/30 bg-card hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-1"
        >
          {course.cover_image && (
            <div className="relative h-56 bg-muted overflow-hidden">
              <Image
                src={course.cover_image}
                alt={`${course.title || "Обложка курса"} — Курсы йоги в Алматы`}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
              <div className="absolute top-3 right-3">
                <Badge className="bg-primary/90 text-primary-foreground shadow-lg border-0">
                  {courseLevelLabel(course.level)}
                </Badge>
              </div>
            </div>
          )}
          <CardContent className="pt-6 pb-6">
            <h3 className="font-bold text-lg sm:text-xl mb-3 line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {course.title}
            </h3>
            {course.average_rating && course.average_rating > 0 && (
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center gap-1">
                  <span className="text-lg">⭐</span>
                  <span className="font-semibold text-foreground">{course.average_rating.toFixed(1)}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  ({course.review_count || 0} {course.review_count === 1 ? 'отзыв' : course.review_count && course.review_count < 5 ? 'отзыва' : 'отзывов'})
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              {userId ? (
                <>
                  <Button 
                    asChild 
                    size="sm" 
                    className="flex-1 min-h-[48px] sm:min-h-0 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    <Link href={`/dashboard/courses/${course.id}/enroll`}>Записаться</Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm" 
                    className="min-h-[48px] sm:min-h-0 rounded-xl border-2 hover:bg-primary/5 transition-all"
                  >
                    <Link href={`/dashboard/courses/${course.id}`}>Подробнее</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    asChild 
                    size="sm" 
                    className="flex-1 min-h-[48px] sm:min-h-0 rounded-xl font-semibold shadow-md hover:shadow-lg transition-all hover:scale-105"
                  >
                    <Link href="/signup">Записаться</Link>
                  </Button>
                  <Button 
                    asChild 
                    variant="outline" 
                    size="sm" 
                    className="min-h-[48px] sm:min-h-0 rounded-xl border-2 hover:bg-primary/5 transition-all"
                  >
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
    <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <Card key={i} className="overflow-hidden rounded-2xl border-2">
          <Skeleton className="h-56 w-full" />
          <CardContent className="pt-6 pb-6">
            <Skeleton className="h-6 w-3/4 mb-3" />
            <Skeleton className="h-5 w-1/2 mb-4" />
            <div className="flex gap-3 mt-6">
              <Skeleton className="h-12 flex-1 rounded-xl" />
              <Skeleton className="h-12 w-28 rounded-xl" />
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
    <div className="min-h-screen min-h-[100dvh] bg-gradient-to-b from-background via-background to-muted/10">
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
        {/* Hero Section */}
        <div className="pt-8 sm:pt-12 md:pt-16 pb-12 sm:pb-16 md:pb-20">
          <HeroSection user={user} coursesHref={coursesHref} />
        </div>

        {/* Promo Banner */}
        <div className="pb-8 sm:pb-12">
          <PromoBanner />
        </div>

        {/* Info Slider */}
        <div className="pb-12 sm:pb-16 md:pb-20">
          <InfoSlider />
        </div>

        {/* Search Section */}
        <section className="scroll-mt-20 pb-12 sm:pb-16 md:pb-20">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 sm:mb-8 text-center text-foreground">
              Найти <span className="text-primary">курс</span>
            </h2>
            <LiveSearch placeholder="Поиск курсов по названию..." />
          </div>
        </section>

        {/* Benefits Section */}
        <BenefitsSection />

        {/* Popular Courses Section */}
        <section className="scroll-mt-20 py-12 sm:py-16 md:py-20">
          <div className="text-center mb-10 sm:mb-12 md:mb-16">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
              Популярные <span className="text-primary">курсы</span>
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
              Выберите курс, который подходит именно вам
            </p>
          </div>
          <Suspense fallback={<PopularCoursesSkeleton />}>
            <PopularCourses userId={user?.id} skipDb={!HAS_SUPABASE} />
          </Suspense>
        </section>

        {/* Testimonials Section */}
        <TestimonialsSection />

        {/* Why Almaty Section */}
        <WhyAlmatySection />

        {/* Final CTA Section */}
        <div className="pt-8 sm:pt-12 md:pt-16 pb-16 sm:pb-20 md:pb-24">
          <FinalCTASection user={user} />
        </div>
      </div>
    </div>
  );
}
