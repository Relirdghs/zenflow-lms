"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface Slide {
  title: string;
  description: string;
  image?: string;
  link?: string;
  linkText?: string;
}

const defaultSlides: Slide[] = [
  {
    title: "Добро пожаловать в ZenFlow",
    description: "Ваш путь к осознанной йога-практике. Курсы, уроки и прогресс — всё в одном месте.",
    link: "/dashboard/courses",
    linkText: "Посмотреть курсы",
  },
  {
    title: "Йога для всех уровней",
    description: "От начинающих до продвинутых практиков. Найдите свой идеальный курс в Алматы.",
    link: "/dashboard/courses",
    linkText: "Выбрать курс",
  },
  {
    title: "Персональный прогресс",
    description: "Отслеживайте свой прогресс, ставьте цели и достигайте новых высот в практике йоги.",
    link: "/dashboard",
    linkText: "Мой прогресс",
  },
];

export function InfoSlider({ slides = defaultSlides }: { slides?: Slide[] }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="relative w-full">
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <div className="relative h-64 sm:h-80">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={cn(
                  "absolute inset-0 transition-opacity duration-500",
                  index === currentIndex ? "opacity-100" : "opacity-0"
                )}
              >
                <div className="flex h-full flex-col items-center justify-center p-6 text-center">
                  <h3 className="text-xl sm:text-2xl font-semibold mb-2">{slide.title}</h3>
                  <p className="text-sm sm:text-base text-muted-foreground mb-4 max-w-md">
                    {slide.description}
                  </p>
                  {slide.link && (
                    <Button asChild>
                      <Link href={slide.link}>{slide.linkText || "Узнать больше"}</Link>
                    </Button>
                  )}
                </div>
              </div>
            ))}

            {/* Навигационные стрелки */}
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2"
              onClick={goToPrevious}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={goToNext}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Индикаторы */}
          <div className="flex justify-center gap-2 p-4">
            {slides.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => goToSlide(index)}
                className={cn(
                  "h-2 w-2 rounded-full transition-all",
                  index === currentIndex ? "bg-primary w-8" : "bg-muted-foreground/30"
                )}
                aria-label={`Перейти к слайду ${index + 1}`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
