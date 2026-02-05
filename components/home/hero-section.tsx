"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Star } from "lucide-react";

interface HeroSectionProps {
  user?: { id: string } | null;
  coursesHref?: string;
}

export function HeroSection({ user, coursesHref = "/dashboard/courses" }: HeroSectionProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const stats = { students: 500, rating: 4.9, reviews: 120 };

  return (
    <section
      className={cn(
        "relative w-full min-h-[70vh] sm:min-h-[75vh] flex items-center justify-center overflow-hidden rounded-2xl sm:rounded-3xl",
        "bg-gradient-to-br from-primary/15 via-background via-40% to-primary/10",
        "border border-border/50 shadow-xl"
      )}
      aria-label="Главный экран"
    >
      {/* Декоративные круги для глубины */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-primary/10 opacity-50" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 py-16 sm:py-20 md:py-24 text-center">
        <div
          className={cn(
            "space-y-6 sm:space-y-8 transition-all duration-700 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          )}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground leading-[1.15] tracking-tight">
            Научитесь йоге в Алматы с{" "}
            <span className="text-primary drop-shadow-sm">ZenFlow</span>
            <span className="block mt-2 text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-muted-foreground">
              онлайн-курсы для тела и души
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Персональный прогресс, опытные преподаватели, практика в любом районе Алматы.
            Начните бесплатно прямо сейчас.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-2">
            {user ? (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto min-h-[48px] text-base sm:text-lg px-8 rounded-xl shadow-lg">
                  <Link href={coursesHref}>Посмотреть курсы</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] text-base sm:text-lg px-8 rounded-xl border-2"
                >
                  <Link href="/dashboard">Перейти в панель</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto min-h-[48px] text-base sm:text-lg px-8 rounded-xl shadow-lg">
                  <Link href="/signup">Начать бесплатно</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] text-base sm:text-lg px-8 rounded-xl border-2"
                >
                  <Link href={coursesHref}>Посмотреть курсы</Link>
                </Button>
              </>
            )}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 pt-10 sm:pt-14">
            <div className="flex items-center gap-2.5 text-sm sm:text-base text-muted-foreground">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
                <Users className="h-5 w-5" />
              </span>
              <span><strong className="text-foreground">{stats.students}+</strong> учеников из Алматы</span>
            </div>
            <div className="flex items-center gap-2.5 text-sm sm:text-base text-muted-foreground">
              <span className="flex items-center justify-center w-10 h-10 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <Star className="h-5 w-5 fill-current" />
              </span>
              <span><strong className="text-foreground">{stats.rating}</strong> на основе {stats.reviews} отзывов</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
