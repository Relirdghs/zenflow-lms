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
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-border p-4 flex flex-row md:flex-col gap-2">
        <Link href="/dashboard" className="text-xl font-semibold text-primary mb-2">
          ZenFlow
        </Link>
        <nav className="flex md:flex-col gap-1 flex-1">
          {nav.map(({ href, label, icon: Icon }) => (
            <Button key={href} variant="ghost" asChild className="justify-start">
              <Link href={href}>
                <Icon className="mr-2 h-4 w-4" />
                {label}
              </Link>
            </Button>
          ))}
        </nav>
      </aside>

      {/* Фиксированная кнопка профиля: Профиль, Прогресс, Выйти */}
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shadow-md">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback>
                  {(profile?.full_name ?? user.email)?.slice(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Профиль</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard">Прогресс</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <form action="/auth/signout" method="post">
                <button type="submit" className="flex items-center w-full cursor-pointer">
                  <LogOut className="mr-2 h-4 w-4" />
                  Выйти
                </button>
              </form>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <main className="flex-1 p-4 md:p-6 overflow-auto pt-14 md:pt-6">{children}</main>
    </div>
  );
}
