import Link from "next/link";
import { Suspense } from "react";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageCircle, Shield } from "lucide-react";
import { RoleUpdater } from "./role-updater";
import { getUserRole } from "@/lib/auth/get-user-role";
import { roleLabel } from "@/lib/role-label";
import type { AppRole } from "@/types/database";
import { Skeleton } from "@/components/ui/skeleton";

// Кэширование на 30 секунд для статичных данных
export const revalidate = 30;

// Компонент статистики (быстро рендерится)
async function StatsCards() {
  const supabase = await createClient();
  
  // КРИТИЧЕСКАЯ ОПТИМИЗАЦИЯ: параллельная загрузка всех count запросов
  const [usersResult, coursesResult, messagesResult] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("courses").select("id", { count: "exact", head: true }),
    supabase.from("messages").select("id", { count: "exact", head: true }),
  ]);

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Пользователи
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{usersResult.count ?? 0}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Курсы
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{coursesResult.count ?? 0}</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Сообщения
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-semibold">{messagesResult.count ?? 0}</p>
        </CardContent>
      </Card>
    </div>
  );
}

// Компонент списка пользователей (загружается отдельно)
async function UsersList() {
  const supabase = await createClient();
  
  // Оптимизация: загружаем только необходимые поля, ограничиваем количество если нужно
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .order("email")
    .limit(100); // Ограничение на случай большого количества пользователей

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Роли пользователей</CardTitle>
        <p className="text-sm text-muted-foreground">
          Изменение ролей пользователей. Доступно только супер-админу.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 sm:space-y-4">
          {(profiles ?? []).map((p: { id: string; full_name: string | null; email: string | null; role: AppRole }) => (
            <div
              key={p.id}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 rounded-lg border p-3"
            >
              <div className="min-w-0">
                <p className="font-medium text-sm sm:text-base truncate">{p.full_name || p.email || p.id.slice(0, 8)}</p>
                <p className="text-xs sm:text-sm text-muted-foreground truncate">{p.email}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Badge variant="secondary" className="text-xs">{roleLabel(p.role)}</Badge>
                <RoleUpdater userId={p.id} currentRole={p.role} />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default async function SuperAdminPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const role = getUserRole(profile?.role ?? null, user);
  if (role !== "super_admin") redirect("/admin");

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 sm:h-6 sm:w-6 text-primary shrink-0" />
          Супер-админ
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground">
          Управление ролями, просмотр всех чатов, назначение админов группам
        </p>
      </div>

      {/* Streaming: статистика загружается первой */}
      <Suspense fallback={
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      }>
        <StatsCards />
      </Suspense>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Быстрые действия</CardTitle>
          <p className="text-sm text-muted-foreground">
            Управляйте курсами, группами, чатами и ролями пользователей
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/courses" prefetch={true}>Курсы</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/groups" prefetch={true}>Группы</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/chat" prefetch={true}>Чат</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin" prefetch={true}>Админ‑панель</Link>
          </Button>
        </CardContent>
      </Card>

      {/* Streaming: список пользователей загружается отдельно */}
      <Suspense fallback={
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      }>
        <UsersList />
      </Suspense>

      <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
        <Button asChild variant="outline" className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
          <Link href="/admin" prefetch={true}>← Админ-панель</Link>
        </Button>
        <Button asChild className="w-full sm:w-auto min-h-[44px] sm:min-h-0">
          <Link href="/admin/chat" prefetch={true}>Чат (все беседы)</Link>
        </Button>
      </div>
    </div>
  );
}
