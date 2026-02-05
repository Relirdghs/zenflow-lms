import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Sparkles, TrendingUp, MapPin, Smartphone, Award } from "lucide-react";

const benefits = [
  {
    icon: Calendar,
    title: "Гибкий график",
    description: "Занимайтесь в удобное для вас время. Все курсы доступны 24/7.",
  },
  {
    icon: Sparkles,
    title: "Персональные рекомендации",
    description: "Система подбирает курсы специально для вас на основе ваших интересов и прогресса.",
  },
  {
    icon: TrendingUp,
    title: "Прогресс-трекинг",
    description: "Отслеживайте свой прогресс по каждому курсу и уроку. Видите свой рост в реальном времени.",
  },
  {
    icon: MapPin,
    title: "Практика в любом районе Алматы",
    description: "Подходит для жителей всех районов: Алмалинский, Бостандыкский, Медеуский, Ауэзовский.",
  },
  {
    icon: Smartphone,
    title: "Доступ с телефона",
    description: "Полностью адаптивный интерфейс. Занимайтесь йогой где угодно — дома, в парке, в офисе.",
  },
  {
    icon: Award,
    title: "Сертификат по окончании",
    description: "Получите сертификат о прохождении курса и делитесь своими достижениями.",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-12 sm:py-16">
      <div className="container mx-auto px-4 sm:px-6 md:px-8">
        <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8 sm:mb-12">
          Почему выбирают ZenFlow
        </h2>
        <div className="grid gap-4 sm:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-primary/10 shrink-0">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold mb-2 text-base sm:text-lg">{benefit.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
