import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BurgerNav } from "@/components/burger-nav";
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageCircle,
  Shield,
  LogOut,
  Star,
  Tag,
} from "lucide-react";
import { getUserRole } from "@/lib/auth/get-user-role";
import { getRoleForRedirect } from "@/lib/auth/role-for-middleware";
import { ThemeToggle } from "@/components/theme/theme-toggle";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Роль через service role, чтобы не было цикла редиректов (anon-профиль часто null из-за RLS)
  const role = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? await getRoleForRedirect(user.id, user.email, user.user_metadata)
    : getUserRole(
        (await supabase.from("profiles").select("role").eq("id", user.id).single()).data?.role ?? null,
        user
      );

  if (role !== "admin" && role !== "super_admin") redirect("/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", user.id)
    .single();

  const nav = [
    { href: "/admin", label: "Обзор", icon: LayoutDashboard },
    { href: "/admin/courses", label: "Курсы", icon: BookOpen },
    { href: "/admin/groups", label: "Группы", icon: Users },
    { href: "/admin/chat", label: "Чат", icon: MessageCircle },
    { href: "/admin/reviews", label: "Модерация отзывов", icon: Star },
    { href: "/admin/promotions", label: "Промо-акции", icon: Tag },
  ];
  if (role === "super_admin") {
    nav.push({ href: "/admin/super", label: "Супер-админ", icon: Shield });
  }

  const burgerItems = nav.map(({ href, label }) => ({ href, label }));

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Кнопки профиля и темы: только на десктопе */}
      <div
        className="hidden md:flex fixed z-50 gap-2 items-center"
        style={{ top: "max(1rem, env(safe-area-inset-top))", right: "max(1rem, env(safe-area-inset-right))" }}
      >
        <ThemeToggle userId={user.id} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 sm:h-11 sm:w-11 shadow-md touch-target flex items-center justify-center">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-sm">
                  {(profile?.full_name ?? user.email)?.slice(0, 2).toUpperCase() ?? "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuItem asChild>
              <Link href="/" className="min-h-[44px] md:min-h-0 flex items-center cursor-pointer">На главную</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action="/auth/signout" method="post">
                <button type="submit" className="flex items-center w-full cursor-pointer min-h-[44px] md:min-h-0">
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Бургер-меню: только на мобильных; главная и выход внутри меню */}
      <BurgerNav
        title="ZenFlow • Админ"
        titleHref="/admin"
        items={burgerItems}
        homeLink={{ href: "/", label: "← На главную" }}
        bottomItems={[{ type: "logout", label: "Выйти" }]}
        className="md:hidden"
      />

      {/* Боковая панель: только на десктопе */}
      <aside className="hidden md:flex md:w-56 shrink-0 border-r border-border p-4 flex-col gap-2">
        <Link href="/admin" className="text-xl font-semibold text-primary mb-2">
          ZenFlow • Админ
        </Link>
        <nav className="flex flex-col gap-1 flex-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Button key={href} variant="ghost" asChild className="justify-start">
              <Link href={href} className="flex items-center">
                <Icon className="mr-2 h-4 w-4 shrink-0" />
                {label}
              </Link>
            </Button>
          ))}
        </nav>
        <Button variant="ghost" asChild size="sm">
          <Link href="/">← На главную</Link>
        </Button>
      </aside>
      <main
        className="flex-1 p-4 sm:p-5 md:p-6 overflow-auto min-w-0 pt-4 md:pt-14"
        style={{
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
          paddingLeft: "max(1rem, env(safe-area-inset-left))",
          paddingRight: "max(1rem, env(safe-area-inset-right))",
        }}
      >
        {children}
      </main>
    </div>
  );
}
