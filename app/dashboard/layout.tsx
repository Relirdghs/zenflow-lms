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
import { LayoutDashboard, BookOpen, Target, MessageCircle, LogOut, Heart, Bell } from "lucide-react";
import { getUserRole } from "@/lib/auth/get-user-role";
import { getRoleForRedirect } from "@/lib/auth/role-for-middleware";
import dynamic from "next/dynamic";
import { NotificationBell } from "@/components/notifications/notification-bell";
import { ThemeToggle } from "@/components/theme/theme-toggle";

// Lazy loading для чат-бота
const FloatingChatbot = dynamic(() => import("@/components/chatbot/floating-chatbot").then(m => ({ default: m.FloatingChatbot })));

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Роль через service role, чтобы редирект срабатывал (anon-профиль часто null из-за RLS)
  const role = process.env.SUPABASE_SERVICE_ROLE_KEY
    ? await getRoleForRedirect(user.id, user.email, user.user_metadata)
    : getUserRole(
        (await supabase.from("profiles").select("role").eq("id", user.id).single()).data?.role ?? null,
        user
      );

  if (role === "super_admin") redirect("/admin/super");
  if (role === "admin") redirect("/admin");

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, avatar_url, role")
    .eq("id", user.id)
    .single();

  const nav = [
    { href: "/dashboard", label: "Обзор", icon: LayoutDashboard },
    { href: "/dashboard/courses", label: "Мои курсы", icon: BookOpen },
    { href: "/dashboard/favorites", label: "Избранное", icon: Heart },
    { href: "/dashboard/goals", label: "Цели", icon: Target },
    { href: "/dashboard/notifications", label: "Уведомления", icon: Bell },
    { href: "/dashboard/chat", label: "Чат", icon: MessageCircle },
  ];

  const burgerItems = nav.map(({ href, label }) => ({ href, label }));

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col md:flex-row bg-background">
      {/* Бургер-меню: только на мобильных; профиль и выход внутри меню */}
      <BurgerNav
        title="ZenFlow"
        titleHref="/dashboard"
        items={burgerItems}
        bottomItems={[
          { type: "link", href: "/dashboard/profile", label: "Профиль" },
          { type: "link", href: "/dashboard", label: "Прогресс" },
          { type: "logout", label: "Выйти" },
        ]}
        className="md:hidden"
      />

      {/* Боковая панель: только на десктопе */}
      <aside className="hidden md:flex md:w-56 shrink-0 border-r border-border p-4 flex-col gap-2">
        <Link href="/dashboard" className="text-xl font-semibold text-primary mb-2">
          ZenFlow
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
      </aside>

      {/* Кнопки профиля, уведомлений и темы: только на десктопе */}
      <div
        className="hidden md:flex fixed z-50 top-4 right-4 gap-2 items-center"
        style={{ top: "max(1rem, env(safe-area-inset-top))", right: "max(1rem, env(safe-area-inset-right))" }}
      >
        <ThemeToggle userId={user.id} />
        <NotificationBell userId={user.id} />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 sm:h-11 sm:w-11 shadow-md touch-target flex items-center justify-center">
              <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback className="text-sm">
                  {(profile?.full_name ?? user.email)?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="min-h-[44px] md:min-h-0 flex items-center cursor-pointer">Профиль</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard" className="min-h-[44px] md:min-h-0 flex items-center cursor-pointer">Прогресс</Link>
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

      {/* Чат-бот */}
      <FloatingChatbot />

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
