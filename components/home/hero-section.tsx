"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Users, Star, Sparkles, ArrowRight, PlayCircle } from "lucide-react";

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
        "relative w-full min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden",
        "bg-gradient-to-br from-primary/20 via-background via-50% to-primary/15",
        "rounded-3xl sm:rounded-[2rem] border border-primary/20 shadow-2xl"
      )}
      aria-label="Главный экран"
    >
      {/* Анимированный фон с градиентами */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Большие размытые круги */}
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full bg-primary/15 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-primary/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/5 blur-3xl" />
        
        {/* Декоративные элементы */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-primary/5 blur-xl animate-bounce delay-500" style={{ animationDuration: '3s' }} />
        <div className="absolute bottom-20 right-10 w-24 h-24 rounded-full bg-primary/8 blur-xl animate-bounce delay-1000" style={{ animationDuration: '4s' }} />
        
        {/* Сетка */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] opacity-40" />
      </div>

      <div className="relative z-10 container mx-auto px-4 sm:px-6 md:px-8 py-20 sm:py-28 md:py-32 text-center">
        <div
          className={cn(
            "space-y-8 sm:space-y-10 md:space-y-12 transition-all duration-1000 ease-out",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
        >
          {/* Бейдж */}
          <div className={cn(
            "inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary transition-all duration-700",
            mounted ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
          )}>
            <Sparkles className="h-4 w-4" />
            <span>Бесплатный доступ к первым урокам</span>
          </div>

          {/* Главный заголовок */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-extrabold text-foreground leading-[1.1] tracking-tight">
              <span className="block">Научитесь йоге</span>
              <span className="block mt-2 bg-gradient-to-r from-primary via-primary/90 to-primary bg-clip-text text-transparent">
                в Алматы
              </span>
              <span className="block mt-3 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-muted-foreground">
                с <span className="text-primary">ZenFlow</span>
              </span>
            </h1>

            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
              Онлайн-курсы для тела и души. Персональный прогресс, опытные преподаватели, практика в любом районе Алматы.
            </p>
          </div>

          {/* CTA кнопки */}
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center pt-4">
            {user ? (
              <>
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full sm:w-auto min-h-[56px] text-base sm:text-lg px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group"
                >
                  <Link href={coursesHref} className="flex items-center gap-2">
                    Посмотреть курсы
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[56px] text-base sm:text-lg px-10 rounded-2xl border-2 hover:bg-primary/5 transition-all duration-300"
                >
                  <Link href="/dashboard" className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Перейти в панель
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full sm:w-auto min-h-[56px] text-base sm:text-lg px-10 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 group bg-gradient-to-r from-primary to-primary/90"
                >
                  <Link href="/signup" className="flex items-center gap-2">
                    Начать бесплатно
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[56px] text-base sm:text-lg px-10 rounded-2xl border-2 hover:bg-primary/5 transition-all duration-300"
                >
                  <Link href={coursesHref} className="flex items-center gap-2">
                    <PlayCircle className="h-5 w-5" />
                    Посмотреть курсы
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Статистика */}
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 md:gap-16 pt-12 sm:pt-16">
            <div className="flex items-center gap-3 text-base sm:text-lg group">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/10 text-primary shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Users className="h-7 w-7" />
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.students}+</div>
                <div className="text-sm sm:text-base text-muted-foreground">учеников из Алматы</div>
              </div>
            </div>
            <div className="flex items-center gap-3 text-base sm:text-lg group">
              <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-600 dark:text-amber-400 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Star className="h-7 w-7 fill-current" />
              </div>
              <div className="text-left">
                <div className="text-2xl sm:text-3xl font-bold text-foreground">{stats.rating}</div>
                <div className="text-sm sm:text-base text-muted-foreground">на основе {stats.reviews} отзывов</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
