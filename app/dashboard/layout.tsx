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
import { LayoutDashboard, BookOpen, Target, MessageCircle, LogOut } from "lucide-react";
import { getUserRole } from "@/lib/auth/get-user-role";
import { getRoleForRedirect } from "@/lib/auth/role-for-middleware";

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
    { href: "/dashboard/goals", label: "Цели", icon: Target },
    { href: "/dashboard/chat", label: "Чат", icon: MessageCircle },
  ];

  return (
    <div className="min-h-screen min-h-[100dvh] flex flex-col md:flex-row bg-background">
      <aside className="w-full md:w-56 shrink-0 border-b md:border-b-0 md:border-r border-border p-3 sm:p-4 flex flex-row md:flex-col gap-1 sm:gap-2 overflow-x-auto md:overflow-x-visible">
        <Link href="/dashboard" className="text-lg sm:text-xl font-semibold text-primary mb-0 md:mb-2 shrink-0 md:shrink">
          ZenFlow
        </Link>
        <nav className="flex md:flex-col gap-1 flex-1 min-w-0">
          {nav.map(({ href, label, icon: Icon }) => (
            <Button key={href} variant="ghost" asChild className="justify-start shrink-0 md:shrink min-h-[44px] md:min-h-0">
              <Link href={href} className="flex items-center">
                <Icon className="mr-2 h-4 w-4 shrink-0" />
                <span className="whitespace-nowrap">{label}</span>
              </Link>
            </Button>
          ))}
        </nav>
      </aside>

      {/* Фиксированная кнопка профиля: safe-area, адаптивно */}
      <div
        className="fixed z-50 top-4 right-4"
        style={{ top: "max(1rem, env(safe-area-inset-top))", right: "max(1rem, env(safe-area-inset-right))" }}
      >
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

      <main
        className="flex-1 p-4 sm:p-5 md:p-6 overflow-auto min-w-0 pt-14 sm:pt-16 md:pt-6"
        style={{
          paddingTop: "max(3.5rem, calc(3.5rem + env(safe-area-inset-top)))",
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
