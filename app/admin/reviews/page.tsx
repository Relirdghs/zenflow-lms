import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RatingStars } from "@/components/reviews/rating-stars";
import { getUserRole } from "@/lib/auth/get-user-role";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ModerateButtons } from "@/components/admin/moderate-buttons";

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = getUserRole(profile?.role ?? null, user);
  if (role !== "admin" && role !== "super_admin") redirect("/dashboard");

  // Получаем все немодерационные отзывы
  const { data: reviews } = await supabase
    .from("reviews")
    .select(`
      id,
      user_id,
      course_id,
      rating,
      comment,
      is_moderated,
      created_at,
      profiles (
        id,
        full_name,
        email
      ),
      courses (
        id,
        title
      )
    `)
    .eq("is_moderated", false)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Модерация отзывов</h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Одобрите или отклоните отзывы пользователей
        </p>
      </div>

      {!reviews || reviews.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground text-center">
              Нет отзывов на модерацию.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {reviews.map((review: any) => {
            const profile = review.profiles;
            const course = review.courses;
            const userName = profile?.full_name || profile?.email || "Анонимный пользователь";
            const initials = userName
              .split(" ")
              .map((n: string) => n[0])
              .join("")
              .toUpperCase()
              .slice(0, 2);

            return (
              <Card key={review.id}>
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <Avatar>
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <CardTitle className="text-base">{userName}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Курс: {course?.title || "Неизвестный курс"}
                      </p>
                      <RatingStars rating={review.rating} size="sm" className="mt-2" />
                    </div>
                    <Badge variant="outline">На модерации</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {review.comment && (
                    <div className="mb-4 p-4 bg-muted rounded-lg border">
                      <p className="text-sm font-medium mb-2">Текст отзыва:</p>
                      <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                        {review.comment}
                      </p>
                    </div>
                  )}
                  {!review.comment && (
                    <p className="text-sm text-muted-foreground mb-4 italic">
                      Отзыв без текстового комментария
                    </p>
                  )}
                  <div className="flex gap-2 flex-wrap">
                    <ModerateButtons reviewId={review.id} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
