import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

const FALLBACK_STATS = { students: 500, rating: 4.9, reviews: 120 };

async function getStats() {
  if (
    typeof process === "undefined" ||
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  ) {
    return FALLBACK_STATS;
  }
  try {
    const supabase = await createClient();

    const [enrollmentsResult, reviewsResult] = await Promise.all([
      supabase.from("enrollments").select("*", { count: "exact", head: true }),
      supabase.from("reviews").select("rating").eq("is_moderated", true),
    ]);

    const studentsCount = enrollmentsResult.count ?? FALLBACK_STATS.students;
    const reviews = reviewsResult.data ?? [];
    const reviewsCount = reviews.length || FALLBACK_STATS.reviews;
    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum: number, r: { rating?: number | null }) => sum + (r.rating || 0), 0) / reviews.length
        : FALLBACK_STATS.rating;

    return {
      students: studentsCount,
      rating: Math.round(averageRating * 10) / 10,
      reviews: reviewsCount,
    };
  } catch {
    return FALLBACK_STATS;
  }
}

export async function WhyAlmatySection() {
  const stats = await getStats();

  return (
    <section className="py-16 sm:py-20 md:py-24 scroll-mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
            Почему выбирают нас в <span className="text-primary">Алматы</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            ZenFlow — это не просто платформа для обучения йоге. Это сообщество единомышленников,
            которые ценят здоровье, осознанность и личностный рост. Мы создали удобную онлайн-платформу
            специально для жителей Алматы, чтобы каждый мог заниматься йогой в удобное время и в любом районе города.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 sm:grid-cols-3 mb-12 sm:mb-16">
          <Card className="group border-2 border-border/50 hover:border-primary/30 bg-card hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-1 overflow-hidden">
            <CardContent className="pt-10 pb-10 px-6 text-center relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-cyan-500" />
              <div className="flex flex-col items-center gap-6">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/10 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Users className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2">
                    {stats.students}+
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-foreground">Учеников из Алматы</p>
                  <p className="text-sm text-muted-foreground mt-2">Присоединяйтесь к сообществу</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-2 border-border/50 hover:border-primary/30 bg-card hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-1 overflow-hidden">
            <CardContent className="pt-10 pb-10 px-6 text-center relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 to-yellow-500" />
              <div className="flex flex-col items-center gap-6">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <Star className="h-10 w-10 fill-amber-500 text-amber-500 dark:fill-amber-400 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-amber-600 to-yellow-600 bg-clip-text text-transparent mb-2">
                    {stats.rating}
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-foreground">Средний рейтинг</p>
                  <p className="text-sm text-muted-foreground mt-2">Высокое качество обучения</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="group border-2 border-border/50 hover:border-primary/30 bg-card hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-1 overflow-hidden">
            <CardContent className="pt-10 pb-10 px-6 text-center relative">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
              <div className="flex flex-col items-center gap-6">
                <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/10 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <MessageSquare className="h-10 w-10 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-5xl sm:text-6xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                    {stats.reviews}+
                  </p>
                  <p className="text-base sm:text-lg font-semibold text-foreground">Отзывов учеников</p>
                  <p className="text-sm text-muted-foreground mt-2">Реальные истории успеха</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Дополнительный текст */}
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-block p-8 rounded-2xl bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-2 border-primary/20">
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
              Присоединяйтесь к сообществу ZenFlow и начните свой путь к здоровью и гармонии.
            </p>
            <p className="text-base sm:text-lg text-foreground font-medium">
              Наши курсы подходят для всех уровней подготовки — от новичков до опытных практиков.
              Занимайтесь в удобное время, отслеживайте прогресс и достигайте новых высот вместе с нами.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
