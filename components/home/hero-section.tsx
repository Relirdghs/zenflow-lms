"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button";
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

  // Социальные доказательства (можно заменить на данные из БД)
  const stats = {
    students: 500,
    rating: 4.9,
    reviews: 120,
  };

  return (
    <section className="relative w-full min-h-[60vh] sm:min-h-[70vh] flex items-center justify-center overflow-hidden rounded-lg mb-8 sm:mb-12">
      {/* Фоновое изображение с overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background z-10" />
        {/* Placeholder для изображения - можно заменить на реальное */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-muted/50 to-background" />
        {/* Если есть изображение hero, раскомментировать:
        <Image
          src="/hero-yoga-almaty.jpg"
          alt="Йога в Алматы — ZenFlow"
          fill
          className="object-cover"
          priority
          sizes="100vw"
        />
        */}
      </div>

      {/* Контент */}
      <div className="relative z-20 container mx-auto px-4 sm:px-6 md:px-8 py-12 sm:py-16 md:py-20 text-center">
        <div
          className={cn(
            "space-y-6 sm:space-y-8 transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          )}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight">
            Научитесь йоге в Алматы с{" "}
            <span className="text-primary">ZenFlow</span>
            <br className="hidden sm:block" />{" "}
            <span className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-semibold text-muted-foreground">
              онлайн-курсы для тела и души
            </span>
          </h1>

          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Персональный прогресс, опытные преподаватели, практика в любом районе Алматы.
            <br className="hidden sm:block" />
            Начните бесплатно прямо сейчас.
          </p>

          {/* CTA кнопки */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center pt-4">
            {user ? (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto min-h-[48px] text-base sm:text-lg px-8">
                  <Link href={coursesHref}>Посмотреть курсы</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] text-base sm:text-lg px-8"
                >
                  <Link href="/dashboard">Перейти в панель</Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto min-h-[48px] text-base sm:text-lg px-8">
                  <Link href="/signup">Начать бесплатно</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] text-base sm:text-lg px-8"
                >
                  <Link href="/dashboard/courses">Посмотреть курсы</Link>
                </Button>
              </>
            )}
          </div>

          {/* Социальные доказательства */}
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 pt-8 sm:pt-12">
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <Users className="h-5 w-5 text-primary" />
              <span className="font-semibold">{stats.students}+</span>
              <span className="text-muted-foreground">учеников из Алматы</span>
            </div>
            <div className="flex items-center gap-2 text-sm sm:text-base">
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
              <span className="font-semibold">{stats.rating}</span>
              <span className="text-muted-foreground">на основе {stats.reviews} отзывов</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
