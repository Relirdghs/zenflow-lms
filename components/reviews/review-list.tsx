import { getCourseReviews } from "@/app/actions/reviews";
import { Card, CardContent } from "@/components/ui/card";
import { RatingStars } from "./rating-stars";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale/ru";

async function ReviewsListContent({ courseId }: { courseId: string }) {
  const reviews = await getCourseReviews(courseId, false);

  if (reviews.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        Пока нет отзывов. Будьте первым, кто оставит отзыв!
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => {
        const profile = review.profiles;
        const userName = profile?.full_name || profile?.email || "Анонимный пользователь";
        const initials = userName
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <Card key={review.id}>
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Avatar>
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm">{userName}</p>
                    <span className="text-xs text-muted-foreground">
                      {review.created_at &&
                        formatDistanceToNow(new Date(review.created_at), {
                          addSuffix: true,
                          locale: ru,
                        })}
                    </span>
                  </div>
                  <RatingStars rating={review.rating} size="sm" />
                  {review.comment && (
                    <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function ReviewList({ courseId }: { courseId: string }) {
  return <ReviewsListContent courseId={courseId} />;
}
