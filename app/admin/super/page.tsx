import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users, BookOpen, MessageCircle, Shield } from "lucide-react";
import { RoleUpdater } from "./role-updater";
import { getUserRole } from "@/lib/auth/get-user-role";
import { roleLabel } from "@/lib/role-label";

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

  const { count: usersCount } = await supabase
    .from("profiles")
    .select("id", { count: "exact", head: true });

  const { count: coursesCount } = await supabase
    .from("courses")
    .select("id", { count: "exact", head: true });

  const { count: messagesCount } = await supabase
    .from("messages")
    .select("id", { count: "exact", head: true });

  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, email, full_name, role")
    .order("email");

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Супер-админ
        </h1>
        <p className="text-muted-foreground">
          Управление ролями, просмотр всех чатов, назначение админов группам
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="h-4 w-4" />
              Пользователи
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold">{usersCount ?? 0}</p>
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
            <p className="text-2xl font-semibold">{coursesCount ?? 0}</p>
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
            <p className="text-2xl font-semibold">{messagesCount ?? 0}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Быстрые действия</CardTitle>
          <p className="text-sm text-muted-foreground">
            Управляйте курсами, группами, чатами и ролями пользователей
          </p>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/admin/courses">Курсы</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/groups">Группы</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/chat">Чат</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin">Админ‑панель</Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Роли пользователей</CardTitle>
          <p className="text-sm text-muted-foreground">
            Изменение ролей пользователей. Доступно только супер-админу.
          </p>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {(profiles ?? []).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between gap-4 rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{p.full_name || p.email || p.id.slice(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">{p.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{roleLabel(p.role)}</Badge>
                  <RoleUpdater userId={p.id} currentRole={p.role} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Button asChild variant="outline">
          <Link href="/admin">← Админ-панель</Link>
        </Button>
        <Button asChild>
          <Link href="/admin/chat">Чат (все беседы)</Link>
        </Button>
      </div>
    </div>
  );
}
