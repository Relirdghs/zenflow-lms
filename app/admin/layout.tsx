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
import {
  LayoutDashboard,
  BookOpen,
  Users,
  MessageCircle,
  Shield,
  LogOut,
} from "lucide-react";
import { getUserRole } from "@/lib/auth/get-user-role";
import { getRoleForRedirect } from "@/lib/auth/role-for-middleware";

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
  ];
  if (role === "super_admin") {
    nav.push({ href: "/admin/super", label: "Супер-админ", icon: Shield });
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-background">
      {/* Фиксированная кнопка профиля: выход из админки, выйти */}
      <div className="fixed top-4 right-4 z-50">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon" className="rounded-full h-10 w-10 shadow-md">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url ?? undefined} />
                <AvatarFallback>
                  {(profile?.full_name ?? user.email)?.slice(0, 2).toUpperCase() ?? "A"}
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link href="/">На главную</Link>
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

      <aside className="w-full md:w-56 border-b md:border-b-0 md:border-r border-border p-4 flex flex-row md:flex-col gap-2">
        <Link href="/admin" className="text-xl font-semibold text-primary mb-2">
          ZenFlow • Админ
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
        <Button variant="ghost" asChild size="sm">
          <Link href="/">← На главную</Link>
        </Button>
      </aside>
      <main className="flex-1 p-4 md:p-6 overflow-auto pt-14 md:pt-6">{children}</main>
    </div>
  );
}
