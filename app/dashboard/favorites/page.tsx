import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { courseLevelLabel } from "@/lib/course-level";
import { getUserFavorites } from "@/app/actions/favorites";
import { FavoriteButton } from "@/components/favorites/favorite-button";

export default async function FavoritesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const favorites = await getUserFavorites(user.id);

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold">Избранное</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Ваши сохраненные курсы</p>
      </div>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4 text-center">
              У вас пока нет избранных курсов.
            </p>
            <Button asChild className="w-full sm:w-auto">
              <Link href="/dashboard/courses">Посмотреть курсы</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((fav: any) => {
            const course = fav.courses;
            if (!course) return null;

            return (
              <Card key={fav.id} className="overflow-hidden">
                {course.cover_image && (
                  <div className="relative h-36 bg-muted">
                    <Image
                      src={course.cover_image}
                      alt={`${course.title || "Обложка курса"} — Курсы йоги в Алматы`}
                      fill
                      className="object-cover"
                      loading="lazy"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{course.title}</span>
                    <Badge variant="secondary">{courseLevelLabel(course.level)}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {course.description}
                  </p>
                  {course.average_rating && course.average_rating > 0 && (
                    <div className="text-xs text-muted-foreground mb-3">
                      ⭐ {course.average_rating.toFixed(1)} ({course.review_count || 0})
                    </div>
                  )}
                  <div className="flex gap-2">
                    <Button asChild size="sm" variant="outline" className="flex-1">
                      <Link href={`/dashboard/courses/${course.id}`}>Открыть</Link>
                    </Button>
                    <FavoriteButton courseId={course.id} userId={user.id} variant="outline" size="sm" />
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
