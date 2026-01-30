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
    <div
      className="min-h-screen min-h-[100dvh] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-gradient-to-b from-muted/50 to-background"
      style={{
        paddingTop: "max(1rem, env(safe-area-inset-top))",
        paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        paddingLeft: "max(1rem, env(safe-area-inset-left))",
        paddingRight: "max(1rem, env(safe-area-inset-right))",
      }}
    >
      <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-primary mb-2 text-center">
        ZenFlow
      </h1>
      <p className="text-sm sm:text-base text-muted-foreground text-center max-w-md mb-6 sm:mb-8 px-2">
        Ваш путь к осознанной йога‑практике. Курсы, уроки и прогресс — всё в одном месте.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full max-w-xs sm:max-w-none">
        {user ? (
          <>
            <a
              href={panelHref}
              className={cn(buttonVariants(), "no-underline w-full sm:w-auto touch-target flex items-center justify-center")}
            >
              Перейти в панель
            </a>
            <a
              href={coursesHref}
              className={cn(buttonVariants({ variant: "outline" }), "no-underline w-full sm:w-auto touch-target flex items-center justify-center")}
            >
              Посмотреть курсы
            </a>
          </>
        ) : (
          <>
            <a
              href="/login"
              className={cn(buttonVariants(), "no-underline w-full sm:w-auto touch-target flex items-center justify-center")}
            >
              Войти
            </a>
            <a
              href="/signup"
              className={cn(buttonVariants({ variant: "outline" }), "no-underline w-full sm:w-auto touch-target flex items-center justify-center")}
            >
              Зарегистрироваться
            </a>
          </>
        )}
      </div>
    </div>
  );
}
