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
    <section className="py-16 sm:py-20 md:py-24 scroll-mt-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-primary/5 rounded-3xl" />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
            Отзывы наших <span className="text-primary">учеников</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Узнайте, что говорят о нас те, кто уже начал свой путь в йоге
          </p>
        </div>

        <div className="relative">
          {/* Слайдер */}
          <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 overflow-hidden">
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
                <Card 
                  key={testimonial.id} 
                  className="h-full group border-2 border-border/50 hover:border-primary/30 bg-card hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-1"
                >
                  <CardContent className="pt-8 pb-8 px-6">
                    <div className="flex flex-col gap-6">
                      <div className="flex items-start gap-4">
                        <div className="relative">
                          <Avatar className="h-14 w-14 ring-2 ring-primary/20 group-hover:ring-primary/40 transition-all">
                            <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/10 text-primary font-bold text-lg">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-base mb-1 text-foreground">{userName}</p>
                          {testimonial.courses?.title && (
                            <p className="text-sm text-muted-foreground mb-3 line-clamp-1">
                              Курс: {testimonial.courses.title}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <RatingStars rating={testimonial.rating} size="sm" />
                            <span className="text-sm font-semibold text-foreground">{testimonial.rating}/5</span>
                          </div>
                        </div>
                      </div>
                      {testimonial.comment && (
                        <div className="relative">
                          <div className="absolute -top-2 -left-2 text-4xl text-primary/20 font-serif">"</div>
                          <p className="text-base text-muted-foreground leading-relaxed line-clamp-5 relative z-10 pl-4">
                            {testimonial.comment}
                          </p>
                        </div>
                      )}
                      <div className="pt-2 border-t border-border/50">
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(testimonial.created_at), {
                            addSuffix: true,
                            locale: ru,
                          })}
                        </p>
                      </div>
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
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 hidden md:flex h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border-2 hover:bg-primary/10 hover:border-primary/30 transition-all disabled:opacity-30"
                aria-label="Предыдущие отзывы"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={goNext}
                disabled={!canGoNext}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 hidden md:flex h-12 w-12 rounded-full shadow-lg bg-background/80 backdrop-blur-sm border-2 hover:bg-primary/10 hover:border-primary/30 transition-all disabled:opacity-30"
                aria-label="Следующие отзывы"
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {/* Индикаторы для мобильных */}
          {testimonials.length > 3 && (
            <div className="flex justify-center gap-2 mt-8 md:hidden">
              {Array.from({ length: Math.ceil(testimonials.length / 3) }).map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i * 3)}
                  className={cn(
                    "h-2.5 rounded-full transition-all duration-300",
                    Math.floor(currentIndex / 3) === i
                      ? "w-10 bg-primary shadow-md"
                      : "w-2.5 bg-muted-foreground/30 hover:bg-muted-foreground/50"
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
