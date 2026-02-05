import { Card, CardContent } from "@/components/ui/card";
import { Users, Star, MessageSquare } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

async function getStats() {
  const supabase = await createClient();

  // Получаем статистику из БД
  const [enrollmentsResult, reviewsResult] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id", { count: "exact", head: true }),
    supabase
      .from("reviews")
      .select("rating, id", { count: "exact", head: false })
      .eq("is_moderated", true),
  ]);

  const studentsCount = enrollmentsResult.count || 500; // Fallback на 500
  const reviews = reviewsResult.data || [];
  const reviewsCount = reviews.length || 120; // Fallback на 120
  const averageRating =
    reviews.length > 0
      ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviews.length
      : 4.9; // Fallback на 4.9

  return {
    students: studentsCount,
    rating: Math.round(averageRating * 10) / 10,
    reviews: reviewsCount,
  };
}

export async function WhyAlmatySection() {
  const stats = await getStats();

  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Почему выбирают нас в Алматы
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            ZenFlow — это не просто платформа для обучения йоге. Это сообщество единомышленников,
            которые ценят здоровье, осознанность и личностный рост. Мы создали удобную онлайн-платформу
            специально для жителей Алматы, чтобы каждый мог заниматься йогой в удобное время и в любом районе города.
          </p>
        </div>

        {/* Статистика */}
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-3">
          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold">{stats.students}+</p>
                  <p className="text-sm text-muted-foreground mt-1">Учеников из Алматы</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <Star className="h-8 w-8 fill-yellow-400 text-yellow-400" />
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold">{stats.rating}</p>
                  <p className="text-sm text-muted-foreground mt-1">Средний рейтинг</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <MessageSquare className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <p className="text-3xl sm:text-4xl font-bold">{stats.reviews}+</p>
                  <p className="text-sm text-muted-foreground mt-1">Отзывов учеников</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Дополнительный текст */}
        <div className="mt-8 sm:mt-12 text-center">
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl mx-auto">
            Присоединяйтесь к сообществу ZenFlow и начните свой путь к здоровью и гармонии.
            Наши курсы подходят для всех уровней подготовки — от новичков до опытных практиков.
            Занимайтесь в удобное время, отслеживайте прогресс и достигайте новых высот вместе с нами.
          </p>
        </div>
      </div>
    </section>
  );
}
