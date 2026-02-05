"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { RatingStars } from "@/components/reviews/rating-stars";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { formatDistanceToNow } from "date-fns";
import { ru } from "date-fns/locale/ru";
import { cn } from "@/lib/utils";

interface Testimonial {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  } | null;
  courses?: {
    title: string;
  } | null;
}

export function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const loadTestimonials = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("reviews")
        .select(
          `
          id,
          rating,
          comment,
          created_at,
          profiles (
            full_name,
            email
          ),
          courses (
            title
          )
        `
        )
        .eq("is_moderated", true)
        .order("created_at", { ascending: false })
        .limit(8);

      if (data) {
        // Преобразуем данные: profiles может быть массивом или объектом
        const formatted = data.map((review: any) => ({
          ...review,
          profiles: Array.isArray(review.profiles) ? review.profiles[0] : review.profiles,
        })) as Testimonial[];
        setTestimonials(formatted);
      }
      setLoading(false);
    };

    loadTestimonials();
  }, []);

  if (loading) {
    return (
      <section className="py-14 sm:py-16 scroll-mt-20">
        <div className="container mx-auto px-4 sm:px-6 md:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-foreground">
            Отзывы наших учеников
          </h2>
          <div className="text-center text-muted-foreground">Загрузка отзывов...</div>
        </div>
      </section>
    );
  }

  if (testimonials.length === 0) {
    return null;
  }

  const visibleTestimonials = testimonials.slice(currentIndex, currentIndex + 3);
  const canGoPrev = currentIndex > 0;
  const canGoNext = currentIndex + 3 < testimonials.length;

  const goPrev = () => {
    setCurrentIndex(Math.max(0, currentIndex - 1));
  };

  const goNext = () => {
    setCurrentIndex(Math.min(testimonials.length - 3, currentIndex + 1));
  };

  return (
    <section className="py-14 sm:py-16 scroll-mt-20 bg-muted/30 rounded-2xl">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-center mb-8 sm:mb-12 text-foreground">
          Отзывы наших учеников
        </h2>

        <div className="relative">
          {/* Слайдер */}
          <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-3 overflow-hidden">
            {visibleTestimonials.map((testimonial) => {
              const userName =
                testimonial.profiles?.full_name ||
                testimonial.profiles?.email ||
                "Анонимный пользователь";
              const initials = userName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);

              return (
                <Card key={testimonial.id} className="h-full">
                  <CardContent className="pt-6">
                    <div className="flex flex-col gap-4">
                      <div className="flex items-start gap-3">
                        <Avatar>
                          <AvatarFallback>{initials}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{userName}</p>
                          {testimonial.courses?.title && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Курс: {testimonial.courses.title}
                            </p>
                          )}
                          <div className="mt-2">
                            <RatingStars rating={testimonial.rating} size="sm" />
                          </div>
                        </div>
                      </div>
                      {testimonial.comment && (
                        <p className="text-sm text-muted-foreground leading-relaxed line-clamp-4">
                          {testimonial.comment}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(testimonial.created_at), {
                          addSuffix: true,
                          locale: ru,
                        })}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Кнопки навигации */}
          {testimonials.length > 3 && (
            <>
              <Button
                variant="outline"
                size="icon"
                onClick={goPrev}
                disabled={!canGoPrev}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 hidden md:flex"
                aria-label="Предыдущие отзывы"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goNext}
                disabled={!canGoNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 hidden md:flex"
                aria-label="Следующие отзывы"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </>
          )}

          {/* Индикаторы для мобильных */}
          {testimonials.length > 3 && (
            <div className="flex justify-center gap-2 mt-6 md:hidden">
              {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i * 3)}
                  className={cn(
                    "h-2 rounded-full transition-all",
                    Math.floor(currentIndex / 3) === i
                      ? "w-8 bg-primary"
                      : "w-2 bg-muted-foreground/30"
                  )}
                  aria-label={`Перейти к странице ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
