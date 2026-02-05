import { Suspense } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { getRoleForRedirect } from "@/lib/auth/role-for-middleware";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { courseLevelLabel } from "@/lib/course-level";
import Link from "next/link";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";

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

const FloatingChatbot = dynamic(() => import("@/components/chatbot/floating-chatbot").then(m => ({ default: m.FloatingChatbot })));

async function PopularCourses() {
  const supabase = await createClient();
  const { data: courses } = await supabase
    .from("courses")
    .select("id, title, description, cover_image, level, average_rating, review_count, is_featured")
    .eq("is_featured", true)
    .order("average_rating", { ascending: false, nullsFirst: false })
    .limit(4);

  if (!courses || courses.length === 0) {
    return null;
  }

  return (
    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
      {courses.map((course) => (
        <Card key={course.id} className="overflow-hidden">
          {course.cover_image && (
            <div className="relative h-36 bg-muted">
              <Image
                src={course.cover_image}
                alt={`${course.title || "Обложка курса"} — Курсы йоги в Алматы`}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
            </div>
          )}
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-sm line-clamp-1">{course.title}</span>
              <Badge variant="secondary" className="text-xs shrink-0">
                {courseLevelLabel(course.level)}
              </Badge>
            </div>
            {course.average_rating && course.average_rating > 0 && (
              <div className="text-xs text-muted-foreground mb-2">
                ⭐ {course.average_rating.toFixed(1)} ({course.review_count || 0})
              </div>
            )}
            <Link href={`/dashboard/courses/${course.id}`} className={cn(buttonVariants({ size: "sm", variant: "outline" }), "w-full mt-2")}>
              Посмотреть
            </Link>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function PopularCoursesSkeleton() {
  return (
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
      <div className="container mx-auto px-4 sm:px-6 md:px-8 py-8 sm:py-12 space-y-8 sm:space-y-12">
        {/* Hero секция */}
        <section className="text-center space-y-4 sm:space-y-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary">
            ZenFlow — Курсы йоги в Алматы
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Ваш путь к осознанной йога‑практике в Алматы. Курсы для всех районов: Алмалинский, Бостандыкский, Медеуский, Ауэзовский. Онлайн обучение йоге с персональным прогрессом.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            {user ? (
              <>
                <a
                  href={panelHref}
                  className={cn(buttonVariants(), "no-underline w-full sm:w-auto touch-target")}
                >
                  Перейти в панель
                </a>
                <a
                  href={coursesHref}
                  className={cn(buttonVariants({ variant: "outline" }), "no-underline w-full sm:w-auto touch-target")}
                >
                  Посмотреть курсы
                </a>
              </>
            ) : (
              <>
                <a
                  href="/login"
                  className={cn(buttonVariants(), "no-underline w-full sm:w-auto touch-target")}
                >
                  Войти
                </a>
                <a
                  href="/signup"
                  className={cn(buttonVariants({ variant: "outline" }), "no-underline w-full sm:w-auto touch-target")}
                >
                  Зарегистрироваться
                </a>
              </>
            )}
          </div>
        </section>

        {/* Промо-блок */}
        <PromoBanner />

        {/* Информационный слайдер */}
        <InfoSlider />

        {/* Поиск курсов */}
        {user && (
          <section>
            <h2 className="text-lg sm:text-xl font-semibold mb-4 text-center">Найти курс</h2>
            <LiveSearch placeholder="Поиск курсов по названию..." />
          </section>
        )}

        {/* Популярные курсы */}
        <section>
          <h2 className="text-lg sm:text-xl font-semibold mb-4">Популярные курсы</h2>
          <Suspense fallback={<PopularCoursesSkeleton />}>
            <PopularCourses />
          </Suspense>
        </section>

        {/* Преимущества платформы */}
        <section className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">🎯 Персональный прогресс</h3>
              <p className="text-sm text-muted-foreground">
                Отслеживайте свой прогресс по каждому курсу и уроку. Ставьте цели и достигайте новых высот.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">📱 Доступ везде</h3>
              <p className="text-sm text-muted-foreground">
                Занимайтесь йогой в любое время и в любом месте. Полностью адаптивный интерфейс для всех устройств.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <h3 className="font-semibold mb-2">👥 Сообщество</h3>
              <p className="text-sm text-muted-foreground">
                Общайтесь с преподавателями и другими учениками. Получайте поддержку на пути к осознанной практике.
              </p>
            </CardContent>
          </Card>
        </section>
      </div>

      {/* Чат-бот */}
      {user && <FloatingChatbot />}
    </div>
  );
}
