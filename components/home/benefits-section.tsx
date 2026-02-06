import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Sparkles, TrendingUp, MapPin, Smartphone, Award } from "lucide-react";

const benefits = [
  {
    icon: Calendar,
    title: "Гибкий график",
    description: "Занимайтесь в удобное для вас время. Все курсы доступны 24/7.",
    gradient: "from-blue-500/20 to-cyan-500/10",
    iconColor: "text-blue-600 dark:text-blue-400",
  },
  {
    icon: Sparkles,
    title: "Персональные рекомендации",
    description: "Система подбирает курсы специально для вас на основе ваших интересов и прогресса.",
    gradient: "from-purple-500/20 to-pink-500/10",
    iconColor: "text-purple-600 dark:text-purple-400",
  },
  {
    icon: TrendingUp,
    title: "Прогресс-трекинг",
    description: "Отслеживайте свой прогресс по каждому курсу и уроку. Видите свой рост в реальном времени.",
    gradient: "from-green-500/20 to-emerald-500/10",
    iconColor: "text-green-600 dark:text-green-400",
  },
  {
    icon: MapPin,
    title: "Практика в любом районе Алматы",
    description: "Подходит для жителей всех районов: Алмалинский, Бостандыкский, Медеуский, Ауэзовский.",
    gradient: "from-orange-500/20 to-amber-500/10",
    iconColor: "text-orange-600 dark:text-orange-400",
  },
  {
    icon: Smartphone,
    title: "Доступ с телефона",
    description: "Полностью адаптивный интерфейс. Занимайтесь йогой где угодно — дома, в парке, в офисе.",
    gradient: "from-indigo-500/20 to-blue-500/10",
    iconColor: "text-indigo-600 dark:text-indigo-400",
  },
  {
    icon: Award,
    title: "Сертификат по окончании",
    description: "Получите сертификат о прохождении курса и делитесь своими достижениями.",
    gradient: "from-amber-500/20 to-yellow-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
  },
];

export function BenefitsSection() {
  return (
    <section className="py-16 sm:py-20 md:py-24 scroll-mt-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
      <div className="container mx-auto px-4 sm:px-6 md:px-8 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold mb-4 text-foreground">
            Почему выбирают <span className="text-primary">ZenFlow</span>
          </h2>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Всё, что нужно для эффективного обучения йоге в одном месте
          </p>
        </div>
        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            return (
              <Card
                key={index}
                className="group overflow-hidden border-2 border-border/50 bg-card hover:border-primary/30 hover:shadow-2xl transition-all duration-300 rounded-2xl hover:-translate-y-1"
              >
                <CardContent className="pt-8 pb-8 px-6">
                  <div className="flex flex-col items-center text-center space-y-4">
                    <div className={`p-4 rounded-2xl bg-gradient-to-br ${benefit.gradient} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                      <Icon className={`h-8 w-8 ${benefit.iconColor}`} />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-bold text-xl text-foreground group-hover:text-primary transition-colors">
                        {benefit.title}
                      </h3>
                      <p className="text-base text-muted-foreground leading-relaxed">
                        {benefit.description}
                      </p>
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
