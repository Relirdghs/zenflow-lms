import { createClient } from "@/lib/supabase/server";
import { buttonVariants } from "@/components/ui/button";
import { getRoleForRedirect } from "@/lib/auth/role-for-middleware";
import { cn } from "@/lib/utils";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let panelHref = "/dashboard";
  let coursesHref = "/dashboard/courses";
  if (user && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const role = await getRoleForRedirect(user.id, user.email, user.user_metadata);
    if (role === "super_admin") {
      panelHref = "/admin/super";
      coursesHref = "/admin/courses";
    } else if (role === "admin") {
      panelHref = "/admin";
      coursesHref = "/admin/courses";
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-gradient-to-b from-muted/50 to-background">
      <h1 className="text-4xl font-semibold text-primary mb-2">ZenFlow</h1>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        Ваш путь к осознанной йога‑практике. Курсы, уроки и прогресс — всё в одном месте.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        {user ? (
          <>
            <a
              href={panelHref}
              className={cn(buttonVariants(), "no-underline")}
            >
              Перейти в панель
            </a>
            <a
              href={coursesHref}
              className={cn(buttonVariants({ variant: "outline" }), "no-underline")}
            >
              Посмотреть курсы
            </a>
          </>
        ) : (
          <>
            <a
              href="/login"
              className={cn(buttonVariants(), "no-underline")}
            >
              Войти
            </a>
            <a
              href="/signup"
              className={cn(buttonVariants({ variant: "outline" }), "no-underline")}
            >
              Зарегистрироваться
            </a>
          </>
        )}
      </div>
    </div>
  );
}
