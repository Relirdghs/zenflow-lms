"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RatingStars } from "./rating-stars";
import { createReview } from "@/app/actions/reviews";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface ReviewFormProps {
  userId: string;
  courseId: string;
  onSuccess?: () => void;
}

export function ReviewForm({ userId, courseId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      toast.error("Пожалуйста, выберите рейтинг");
      return;
    }

    setSubmitting(true);
    try {
      const result = await createReview(userId, courseId, rating, comment);
      if (result.success) {
        toast.success("Отзыв отправлен на модерацию");
        setRating(0);
        setComment("");
        onSuccess?.();
        router.refresh();
      } else {
        toast.error(result.error || "Ошибка при отправке отзыва");
      }
    } catch (error) {
      toast.error("Ошибка при отправке отзыва");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium mb-2 block">Ваша оценка</label>
        <RatingStars
          rating={rating}
          interactive
          onRatingChange={setRating}
          size="lg"
        />
      </div>

      <div>
        <label htmlFor="comment" className="text-sm font-medium mb-2 block">
          Комментарий (необязательно)
        </label>
        <Textarea
          id="comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Поделитесь своими впечатлениями о курсе..."
          rows={4}
        />
      </div>

      <Button type="submit" disabled={submitting || rating === 0} className="min-h-[44px] sm:min-h-0">
        {submitting ? "Отправка..." : "Отправить отзыв"}
      </Button>
    </form>
  );
}
