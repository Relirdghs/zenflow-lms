import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface FinalCTASectionProps {
  user?: { id: string } | null;
}

export function FinalCTASection({ user }: FinalCTASectionProps) {
  return (
    <section className="py-16 sm:py-20 md:py-24 rounded-2xl sm:rounded-3xl bg-gradient-to-br from-primary/10 via-primary/5 to-background border border-primary/20 shadow-inner">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <div className="max-w-3xl mx-auto text-center space-y-6 sm:space-y-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
            Готовы начать свой путь в йоге?
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Присоединяйтесь к тысячам учеников из Алматы, которые уже начали свой путь к здоровью и гармонии.
            Начните обучение бесплатно прямо сейчас.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            {user ? (
              <>
                <Button asChild size="lg" className="w-full sm:w-auto min-h-[48px] text-base sm:text-lg px-8">
                  <Link href="/dashboard/courses">
                    Посмотреть курсы
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
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
                  <Link href="/signup">
                    Начать обучение бесплатно
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[48px] text-base sm:text-lg px-8"
                >
                  <Link href="/dashboard/courses">Смотреть курсы</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
