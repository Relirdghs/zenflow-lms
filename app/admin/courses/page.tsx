import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { courseLevelLabel } from "@/lib/course-level";
import { getUserRole } from "@/lib/auth/get-user-role";

export default async function AdminCoursesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  const role = getUserRole(profile?.role ?? null, user);
  const isSuperAdmin = role === "super_admin";
  const query = supabase
    .from("courses")
    .select("id, title, description, level, is_public, created_at")
    .order("created_at", { ascending: false });
  if (!isSuperAdmin) {
    query.eq("created_by", user.id);
  }
  const { data: courses } = await query;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Курсы</h1>
          <p className="text-muted-foreground">Создание и редактирование курсов</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new">Новый курс</Link>
        </Button>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(courses ?? []).map((c) => (
          <Card key={c.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <span className="font-medium">{c.title}</span>
                <div className="flex items-center gap-2">
                  {c.is_public === false && (
                    <Badge variant="outline">Закрытый</Badge>
                  )}
                  <Badge variant="secondary">{courseLevelLabel(c.level)}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                {c.description}
              </p>
              <div className="flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/admin/courses/${c.id}/lessons`}>Уроки</Link>
                </Button>
                <Button asChild size="sm">
                  <Link href={`/admin/courses/${c.id}/edit`}>Редактировать</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      {(!courses || courses.length === 0) && (
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground mb-4">Нет курсов.</p>
            <Button asChild>
              <Link href="/admin/courses/new">Создать первый курс</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
