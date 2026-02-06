import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

interface FinalCTASectionProps {
  user?: { id: string } | null;
}

const benefits = [
  "Бесплатный доступ к первым урокам",
  "Персональный прогресс-трекинг",
  "Сертификат по окончании курса",
];

export function FinalCTASection({ user }: FinalCTASectionProps) {
  return (
    <section className="py-20 sm:py-24 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-primary/5 rounded-3xl" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,0,0,0.02),transparent_70%)]" />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-8 sm:space-y-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm font-medium text-primary mb-4">
            <Sparkles className="h-4 w-4" />
            <span>Начните прямо сейчас</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight">
            Готовы начать свой путь в <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">йоге?</span>
          </h2>
          
          <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Присоединяйтесь к тысячам учеников из Алматы, которые уже начали свой путь к здоровью и гармонии.
          </p>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4 pt-4">
            {benefits.map((benefit, index) => (
              <div 
                key={index}
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-background/80 backdrop-blur-sm border border-border/50 text-sm font-medium text-foreground shadow-sm"
              >
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>{benefit}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center items-center pt-6">
            {user ? (
              <>
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full sm:w-auto min-h-[60px] text-base sm:text-lg px-10 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group bg-gradient-to-r from-primary to-primary/90"
                >
                  <Link href="/dashboard/courses" className="flex items-center gap-2">
                    Посмотреть курсы
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[60px] text-base sm:text-lg px-10 rounded-2xl border-2 hover:bg-primary/5 transition-all duration-300"
                >
                  <Link href="/dashboard">Перейти в панель</Link>
                </Button>
              </>
            ) : (
              <>
                <Button 
                  asChild 
                  size="lg" 
                  className="w-full sm:w-auto min-h-[60px] text-base sm:text-lg px-10 rounded-2xl shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group bg-gradient-to-r from-primary to-primary/90"
                >
                  <Link href="/signup" className="flex items-center gap-2">
                    Начать обучение бесплатно
                    <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto min-h-[60px] text-base sm:text-lg px-10 rounded-2xl border-2 hover:bg-primary/5 transition-all duration-300"
                >
                  <Link href="/dashboard/courses">Смотреть курсы</Link>
                </Button>
              </>
            )}
          </div>

          <p className="text-sm text-muted-foreground pt-4">
            Без кредитной карты • Отмена в любой момент • Доступ 24/7
          </p>
        </div>
      </div>
    </section>
  );
}
